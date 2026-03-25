"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, Trash2, Loader2, Inbox, Clock, User as UserIcon } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function VirtualInboxPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const[isSheetOpen, setIsSheetOpen] = useState(false);

  const emailsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, "users", user.uid, "emails"),
      orderBy("receivedAt", "desc")
    );
  }, [firestore, user?.uid]);

  const { data: emails, isLoading } = useCollection(emailsQuery);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEmail = (email: any) => {
    setSelectedEmail(email);
    setIsSheetOpen(true);

    // Đánh dấu đã đọc nếu chưa đọc
    if (!email.isRead && firestore && user?.uid) {
      const emailRef = doc(firestore, "users", user.uid, "emails", email.id);
      updateDocumentNonBlocking(emailRef, { isRead: true });
    }
  };

  const handleDeleteEmail = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation(); // Ngăn không cho click lan ra ngoài (mở mail)
    if (!firestore || !user?.uid) return;
    
    const emailRef = doc(firestore, "users", user.uid, "emails", emailId);
    deleteDocumentNonBlocking(emailRef);
    
    toast({
      title: "Đã xóa",
      description: "Email đã được xóa khỏi hộp thư.",
    });

    if (selectedEmail?.id === emailId) {
      setIsSheetOpen(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-accent" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
          <Inbox className="w-8 h-8 text-accent" /> Hộp thư ảo
        </h2>
        <p className="text-muted-foreground mt-1">
          Nơi lưu trữ 50 email gần nhất được chuyển tiếp đến hệ thống. Bạn có thể xem mã OTP hoặc click link xác nhận thủ công tại đây.
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">Danh sách Email nhận được</CardTitle>
          <CardDescription>Tự động làm mới (Real-time)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {emails && emails.length > 0 ? (
            <div className="divide-y">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  onClick={() => handleOpenEmail(email)}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors hover:bg-slate-50 ${!email.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start gap-4 overflow-hidden">
                    <div className="mt-1 shrink-0">
                      {!email.isRead ? (
                        <div className="relative">
                          <Mail className="w-5 h-5 text-accent" />
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
                        </div>
                      ) : (
                        <MailOpen className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`truncate text-sm ${!email.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {email.fromName || email.from}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-normal shrink-0">
                          {email.from}
                        </Badge>
                      </div>
                      <p className={`truncate text-sm mb-1 ${!email.isRead ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                        {email.subject}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {email.snippet}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {email.receivedAt ? format(new Date(email.receivedAt), "dd/MM/yyyy HH:mm") : ""}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteEmail(e, email.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
              <Inbox className="w-12 h-12 text-slate-200 mb-4" />
              <p>Hộp thư trống.</p>
              <p className="text-sm mt-1">Hệ thống chưa nhận được email nào chuyển tiếp đến.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trình đọc Email (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
          <SheetHeader className="p-6 border-b bg-slate-50 shrink-0">
            <div className="flex justify-between items-start gap-4">
              <div>
                <SheetTitle className="text-xl leading-tight mb-4">{selectedEmail?.subject}</SheetTitle>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-bold text-slate-900">{selectedEmail?.fromName || 'Unknown'}</span>
                    <span>&lt;{selectedEmail?.from}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{selectedEmail?.receivedAt ? format(new Date(selectedEmail.receivedAt), "dd/MM/yyyy HH:mm:ss") : ""}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={(e) => selectedEmail && handleDeleteEmail(e, selectedEmail.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6">
            {/* CẢNH BÁO: Render HTML trực tiếp từ Email. Đã bọc trong class prose để format đẹp hơn */}
            <div 
              className="prose prose-sm sm:prose-base max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 break-words"
              dangerouslySetInnerHTML={{ __html: selectedEmail?.bodyHtml || '<p>Không có nội dung</p>' }}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}