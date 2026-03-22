'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Lắng nghe lỗi phân quyền và hiển thị Toast thay vì làm Crash toàn bộ App
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("[Firebase Global Error]", error);
      toast({
        variant: "destructive",
        title: "Lỗi truy cập dữ liệu",
        description: "Phiên đăng nhập có vấn đề hoặc thiếu quyền. Vui lòng tải lại trang."
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
