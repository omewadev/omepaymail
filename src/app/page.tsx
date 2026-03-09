'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Zap, ArrowRight, Globe, FileCode, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useFirebase } from '@/firebase/provider'; 
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const[isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: "Firebase chưa sẵn sàng." });
      return;
    }
    
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      // Kiểm tra xem user đã có trong Database chưa, nếu chưa thì tạo mới
      const userRef = doc(firestore, 'users', loggedInUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName || '',
          planName: 'Free',
          transactionLimit: 100,
          transactionCount: 0,
          createdAt: new Date().toISOString()
        });
      }

      toast({ title: "Đăng nhập thành công!" });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ variant: "destructive", title: "Đăng nhập thất bại", description: error.message });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="h-20 border-b border-border px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#293462] flex items-center justify-center text-white font-bold text-xl">P</div>
          <span className="font-headline font-bold text-xl text-[#293462]">PayMailHook</span>
        </div>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          
          {isUserLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#293462]" />
          ) : !user ? (
            <>
              <button onClick={handleGoogleLogin} className="text-sm font-medium hover:text-[#6F2DBD] transition-colors">
                Đăng nhập
              </button>
              <Button onClick={handleGoogleLogin} disabled={isLoggingIn} style={{ backgroundColor: '#6F2DBD', color: 'white' }}>
                {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Đăng ký
              </Button>
            </>
          ) : (
            <Button asChild style={{ backgroundColor: '#293462', color: 'white' }}>
              <Link href="/dashboard">Vào Dashboard</Link>
            </Button>
          )}
        </div>
      </nav>

      <section className="py-24 px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-[#293462] mb-6 tracking-tight">
          Cổng thanh toán tự động qua <span style={{ color: '#6F2DBD' }}>Gmail</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Cầu nối giữa thông báo ngân hàng và website của bạn. Tự động hóa duyệt đơn hàng cho WordPress và mọi nền tảng Web khác chỉ trong vài phút.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <Button size="lg" asChild className="px-8 h-14 text-lg" style={{ backgroundColor: '#293462', color: 'white' }}>
              <Link href="/dashboard">Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          ) : (
            <Button size="lg" onClick={handleGoogleLogin} disabled={isLoggingIn} className="px-8 h-14 text-lg" style={{ backgroundColor: '#293462', color: 'white' }}>
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
          <Button variant="outline" size="lg" className="px-8 h-14 text-lg border-[#293462] text-[#293462] hover:bg-opacity-5 hover:bg-[#293462]" asChild>
            <Link href="/docs"><FileCode className="mr-2 w-5 h-5" /> Xem Tài liệu</Link>
          </Button>
        </div>
      </section>

      <section className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-opacity-10 bg-[#293462] flex items-center justify-center mb-6">
              <Mail className="text-[#293462] w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Gmail Listener</h3>
            <p className="text-muted-foreground">Theo dõi thời gian thực hộp thư Gmail để phát hiện biến động số dư ngân hàng thông qua API an toàn.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-opacity-10 bg-[#6F2DBD] flex items-center justify-center mb-6">
              <Zap className="text-[#6F2DBD] w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Universal Webhooks</h3>
            <p className="text-muted-foreground">Gửi dữ liệu giao dịch về bất kỳ hệ thống nào (WordPress, Node.js, PHP...) ngay lập tức khi phát hiện tiền về.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
              <Globe className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Tương thích đa nền tảng</h3>
            <p className="text-muted-foreground">Hỗ trợ tốt nhất cho WooCommerce (WordPress) và cung cấp API JSON chuẩn cho các ứng dụng tùy chỉnh.</p>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-border mt-20 text-center text-muted-foreground">
        <p>© 2026 PayMailHook Inc. Tốc độ - Bảo mật - Tin cậy.</p>
      </footer>
    </div>
  );
}