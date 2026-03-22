'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Zap, ArrowRight, Globe, FileCode, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useFirebase } from '@/firebase/provider'; 
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  // States cho Modal Đăng nhập
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Xử lý Quên mật khẩu
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!email) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng nhập email để nhận liên kết khôi phục." });
      return;
    }
    setIsEmailLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Thành công!", description: "Vui lòng kiểm tra hộp thư (kể cả thư rác) để đặt lại mật khẩu." });
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({ variant: "destructive", title: "Thất bại", description: "Không thể gửi email khôi phục. Vui lòng kiểm tra lại địa chỉ email." });
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Xử lý đăng nhập/đăng ký bằng Email & Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: "Firebase chưa sẵn sàng." });
      return;
    }
    
    setIsEmailLoading(true);
    try {
      if (authTab === "register") {
        if (password !== confirmPassword) {
          toast({ variant: "destructive", title: "Lỗi", description: "Mật khẩu nhập lại không khớp." });
          setIsEmailLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const loggedInUser = result.user;
        
       // Tạo profile trong Firestore
       const userRef = doc(firestore, 'users', loggedInUser.uid);
       const userRole = loggedInUser.email === 'omewadev@gmail.com' ? 'admin' : 'customer';
       await setDoc(userRef, {
         id: loggedInUser.uid,
         email: loggedInUser.email,
         displayName: email.split('@')[0], // Lấy tạm tên từ email
         planName: 'Free',
         transactionLimit: 100,
         transactionCount: 0,
         role: userRole,
         createdAt: new Date().toISOString()
       });
       toast({ title: "Đăng ký thành công!" });
       setIsAuthModalOpen(false);
       router.push(userRole === 'admin' ? '/admin' : '/dashboard');
     } else {
       const result = await signInWithEmailAndPassword(auth, email, password);
       toast({ title: "Đăng nhập thành công!" });
       setIsAuthModalOpen(false);
       
       // Kiểm tra role để chuyển hướng
       const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
       if (userDoc.exists() && userDoc.data().role === 'admin') {
         router.push('/admin');
       } else {
         router.push('/dashboard');
       }
     }
   } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại.";
      
      // Dịch lỗi Firebase sang Tiếng Việt
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = "Email hoặc mật khẩu không chính xác. Nếu chưa có tài khoản, vui lòng Đăng ký.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.";
          break;
        case 'auth/weak-password':
          errorMessage = "Mật khẩu quá yếu. Vui lòng nhập ít nhất 6 ký tự.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.";
          break;
        default:
          errorMessage = error.message;
      }

      toast({ variant: "destructive", title: "Thất bại", description: errorMessage });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Lỗi hệ thống", description: "Firebase chưa sẵn sàng." });
      return;
    }
    
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    // Ép Google luôn hiện bảng chọn tài khoản để tăng bảo mật
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      // Kiểm tra xem user đã có trong Database chưa, nếu chưa thì tạo mới
      const userRef = doc(firestore, 'users', loggedInUser.uid);
      const userSnap = await getDoc(userRef);

      let userRole = 'customer';
      if (!userSnap.exists()) {
        userRole = loggedInUser.email === 'omewadev@gmail.com' ? 'admin' : 'customer';
        await setDoc(userRef, {
          id: loggedInUser.uid,
          email: loggedInUser.email,
          displayName: loggedInUser.displayName || '',
          planName: 'Free',
          transactionLimit: 100,
          transactionCount: 0,
          role: userRole,
          createdAt: new Date().toISOString()
        });
      } else {
        userRole = userSnap.data().role || 'customer';
      }

      toast({ title: "Đăng nhập thành công!" });
      router.push(userRole === 'admin' ? '/admin' : '/dashboard');
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
              <button onClick={() => { setAuthTab("login"); setIsAuthModalOpen(true); }} className="text-sm font-medium hover:text-[#6F2DBD] transition-colors">
                Đăng nhập
              </button>
              <Button onClick={() => { setAuthTab("register"); setIsAuthModalOpen(true); }} style={{ backgroundColor: '#6F2DBD', color: 'white' }}>
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
            <Button size="lg" onClick={() => { setAuthTab("register"); setIsAuthModalOpen(true); }} className="px-8 h-14 text-lg" style={{ backgroundColor: '#293462', color: 'white' }}>
              Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
          <Button variant="outline" size="lg" className="px-8 h-14 text-lg border-[#293462] text-[#293462] hover:bg-opacity-5 hover:bg-[#293462]" asChild>
            <Link href="/huong-dan"><FileCode className="mr-2 w-5 h-5" /> Xem Tài liệu</Link>
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

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={(open) => {
        setIsAuthModalOpen(open);
        if (!open) setIsForgotPassword(false);
      }}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle className="text-center text-2xl font-headline text-[#293462]">
              {isForgotPassword ? "Khôi phục mật khẩu" : "Chào mừng đến PayMailHook"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isForgotPassword ? "Nhập email của bạn để nhận liên kết đặt lại mật khẩu." : "Đăng nhập hoặc tạo tài khoản để tiếp tục."}
            </DialogDescription>
          </DialogHeader>
          
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              <Button type="submit" className="w-full" disabled={isEmailLoading} style={{ backgroundColor: '#293462', color: 'white' }}>
                {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gửi email khôi phục
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>
                Quay lại đăng nhập
              </Button>
            </form>
          ) : (
            <>
              <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "register")} className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-[#6F2DBD] hover:underline font-medium">
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isEmailLoading} style={{ backgroundColor: '#293462', color: 'white' }}>
                  {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Đăng nhập
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mật khẩu (tối thiểu 6 ký tự)</Label>
                  <div className="relative">
                    <Input id="reg-password" type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Nhập lại mật khẩu</Label>
                  <div className="relative">
                    <Input id="reg-confirm-password" type={showConfirmPassword ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isEmailLoading} style={{ backgroundColor: '#6F2DBD', color: 'white' }}>
                  {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Tạo tài khoản
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          <Button variant="outline" type="button" disabled={isLoggingIn} onClick={handleGoogleLogin} className="w-full">
            {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Tiếp tục với Google
          </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}