"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mail, MailOpen, Trash2, Loader2, Inbox, Clock, User as UserIcon, Search, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc, limit } from "firebase/firestore";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function VirtualInboxPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // State cho Tìm kiếm và Phân trang
  const [searchQuery, setSearchQuery] = useState("");
  const[currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 20;

  // Lấy tối đa 1000 email mới nhất từ Database
  const emailsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, "users", user.uid, "emails"),
      orderBy("receivedAt", "desc"),
      limit(1000)
    );
  }, [firestore, user?.uid]);

  const { data: emails, isLoading } = useCollection(emailsQuery);

  // Reset về trang 1 khi người dùng gõ tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Logic Lọc (Search) và Phân trang (Pagination) ở Client-side
  const { paginatedEmails, totalPages, totalFiltered } = useMemo(() => {
    if (!emails) return { paginatedEmails:[], totalPages: 0, totalFiltered: 0 };

    // 1. Lọc theo từ khóa
    const filtered = emails.filter((email) => {
      const q = searchQuery.toLowerCase();
      return (
        (email.subject || "").toLowerCase().includes(q) ||
        (email.from || "").toLowerCase().includes(q) ||
        (email.fromName || "").toLowerCase().includes(q) ||
        (email.snippet || "").toLowerCase().includes(q)
      );
    });

    // 2. Phân trang
    const total = filtered.length;
    const pages = Math.ceil(total / emailsPerPage);
    const startIndex = (currentPage - 1) * emailsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + emailsPerPage);

    return { paginatedEmails: paginated, totalPages: pages, totalFiltered: total };
  }, [emails, searchQuery, currentPage]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEmail = (email: any) => {
    setSelectedEmail(email);
    setIsSheetOpen(true);

    if (!email.isRead && firestore && user?.uid) {
      const emailRef = doc(firestore, "users", user.uid, "emails", email.id);
      updateDocumentNonBlocking(emailRef, { isRead: true });
    }
  };

  const handleDeleteEmail = (e: React.MouseEvent, emailId: string) => {
    e.stopPropagation();
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
        
        {/* Hướng dẫn xử lý thủ công */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
          <p className="font-bold flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" /> Hướng dẫn xác minh thủ công:
          </p>
          <p>Bạn có thể xem mã OTP hoặc click link xác nhận thủ công tại đây, nếu chưa được bạn hãy:</p>
          <ul className="list-decimal pl-5 mt-2 space-y-1">
            <li>Hãy <b>Copy chính xác đường link</b> dùng để xác minh trong mail yêu cầu xác minh.</li>
            <li>Mở một Tab mới trên trình duyệt, Tab này <b>phải đang đăng nhập sẵn tài khoản gmail</b> đang muốn xác minh.</li>
            <li>Dán đường link đó vào thanh địa chỉ và nhấn Enter.</li>
          </ul>
          <p className="mt-2 font-medium text-blue-700">👉 Kết quả: Google sẽ báo xác minh thành công ngay lập tức!</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-slate-50/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Danh sách Email nhận được</CardTitle>
              <CardDescription>Lưu trữ tối đa 1000 email gần nhất</CardDescription>
            </div>
            {/* Thanh tìm kiếm */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm mail..." 
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {paginatedEmails.length > 0 ? (
            <div className="divide-y">
              {paginatedEmails.map((email) => (
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
              <p>{searchQuery ? "Không tìm thấy email nào phù hợp." : "Hộp thư trống."}</p>
            </div>
          )}
        </CardContent>

        {/* Phân trang (Pagination) */}
        {totalPages > 1 && (
          <CardFooter className="border-t bg-slate-50/50 p-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Hiển thị <b>{(currentPage - 1) * emailsPerPage + 1}</b> - <b>{Math.min(currentPage * emailsPerPage, totalFiltered)}</b> trong số <b>{totalFiltered}</b> email
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium px-2">
                Trang {currentPage} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        )}
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
            <div 
              className="prose prose-sm sm:prose-base max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 whitespace-pre-wrap break-words break-all"
              dangerouslySetInnerHTML={{ 
                __html: selectedEmail?.bodyHtml 
                  ? (selectedEmail.bodyHtml.includes('<html') || selectedEmail.bodyHtml.includes('<div') || selectedEmail.bodyHtml.includes('<p>'))
                    ? selectedEmail.bodyHtml 
                    : selectedEmail.bodyHtml 
                        .replace(/(https?:\/\/[^\s"<>]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-blue-600">$1</a>')
                  : '<p>Không có nội dung</p>' 
              }}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}