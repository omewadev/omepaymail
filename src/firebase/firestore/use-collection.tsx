'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] =[];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setIsLoading(false);
      },
      (_error: FirestoreError) => {
        console.error("[useCollection Error]:", _error);
        setError(_error); // Trả về đúng lỗi gốc để UI tự xử lý
        setData(null);
        setIsLoading(false);
        
        // Chỉ phát ra Global Error nếu ĐÚNG là lỗi phân quyền
        if (_error.code === 'permission-denied') {
          const path: string =
            memoizedTargetRefOrQuery.type === 'collection'
              ? (memoizedTargetRefOrQuery as CollectionReference).path
              : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path,
          });
          errorEmitter.emit('permission-error', contextualError);
        }
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}