'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Zap, ArrowRight, Globe, FileCode, Loader2, BookOpen, Eye, EyeOff } from 'lucide-react';
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

export default function Home() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !email) return;
    setIsEmailLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Thành công!", description: "Vui lòng kiểm tra email để đặt lại mật khẩu." });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể gửi email khôi phục." });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsEmailLoading(true);
    try {
      if (authTab === "register") {
        if (password !== confirmPassword) {
          toast({ variant: "destructive", title: "Lỗi", description: "Mật khẩu không khớp." });
          setIsEmailLoading(false);
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const userRef = doc(firestore, 'users', result.user.uid);
        const userRole = result.user.email === 'omewadev@gmail.com' ? 'admin' : 'customer';
        await setDoc(userRef, {
          id: result.user.uid,
          uidLower: result.user.uid.toLowerCase(),
          email: result.user.email,
          displayName: email.split('@')[0],
          planName: 'Free',
          transactionLimit: 100,
          transactionCount: 0,
          role: userRole,
          createdAt: new Date().toISOString()
        });
        router.push(userRole === 'admin' ? '/admin' : '/dashboard');
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
        router.push(userDoc.exists() && userDoc.data().role === 'admin' ? '/admin' : '/dashboard');
      }
      setIsAuthModalOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(firestore, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      let userRole = 'customer';
      if (!userSnap.exists()) {
        userRole = result.user.email === 'omewadev@gmail.com' ? 'admin' : 'customer';
        await setDoc(userRef, {
          id: result.user.uid,
          uidLower: result.user.uid.toLowerCase(),
          email: result.user.email,
          displayName: result.user.displayName || '',
          planName: 'Free',
          transactionLimit: 100,
          transactionCount: 0,
          role: userRole,
          createdAt: new Date().toISOString()
        });
      } else {
        userRole = userSnap.data().role || 'customer';
      }
      router.push(userRole === 'admin' ? '/admin' : '/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="h-20 border-b border-border px-4 md:px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#293462] flex items-center justify-center text-white font-bold text-xl">P</div>
          <span className="font-headline font-bold text-xl text-[#293462]">PayMailHook</span>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <LanguageSwitcher />
          {isUserLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#293462]" />
          ) : !user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => { setAuthTab("login"); setIsAuthModalOpen(true); }} className="text-sm font-medium hover:text-[#6F2DBD] transition-colors hidden sm:block">
                Đăng nhập
              </button>
              <Button onClick={() => { setAuthTab("register"); setIsAuthModalOpen(true); }} style={{ backgroundColor: '#6F2DBD', color: 'white' }} className="h-9 px-3 text-sm">
                Đăng ký
              </Button>
            </div>
          ) : (
            <Button asChild style={{ backgroundColor: '#293462', color: 'white' }} className="h-9 px-3 text-sm">
              <Link href="/dashboard">Vào Dashboard</Link>
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-24 px-4 md:px-8 max-w-7xl mx-auto text-center w-full">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-headline font-extrabold text-[#293462] mb-6 tracking-tight leading-tight">
          Cổng thanh toán tự động qua <span style={{ color: '#6F2DBD' }}>Gmail</span>
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Cầu nối giữa thông báo ngân hàng và website của bạn. Tự động hóa duyệt đơn hàng chỉ trong vài phút.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
          {user ? (
            <Button size="lg" asChild className="h-14 text-lg w-full sm:w-auto px-8" style={{ backgroundColor: '#293462', color: 'white' }}>
              <Link href="/dashboard" className="flex items-center justify-center">Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          ) : (
            <Button size="lg" onClick={() => { setAuthTab("register"); setIsAuthModalOpen(true); }} className="h-14 text-lg w-full sm:w-auto px-8" style={{ backgroundColor: '#293462', color: 'white' }}>
              <span className="flex items-center justify-center">Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" /></span>
            </Button>
          )}
          <Button variant="outline" size="lg" className="h-14 text-lg border-[#293462] text-[#293462] w-full sm:w-auto px-8" asChild>
            <Link href="/huong-dan" className="flex items-center justify-center"><BookOpen className="mr-2 w-5 h-5" /> Hướng dẫn</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-[#293462]/10 flex items-center justify-center mb-6">
              <Mail className="text-[#293462] w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Gmail Listener</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Theo dõi thời gian thực hộp thư Gmail để phát hiện biến động số dư ngân hàng thông qua API an toàn.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-[#6F2DBD]/10 flex items-center justify-center mb-6">
              <Zap className="text-[#6F2DBD] w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Universal Webhooks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Gửi dữ liệu giao dịch về bất kỳ hệ thống nào (WordPress, Node.js, PHP...) ngay lập tức khi có tiền về.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
              <Globe className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Đa nền tảng</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Hỗ trợ tốt nhất cho WooCommerce (WordPress) và cung cấp API JSON chuẩn cho các ứng dụng tùy chỉnh.</p>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-border text-center text-muted-foreground text-sm">
        <p>© 2026 PayMailHook Inc. Tốc độ - Bảo mật - Tin cậy.</p>
      </footer>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={(open) => { setIsAuthModalOpen(open); if (!open) setIsForgotPassword(false); }}>
        <DialogContent className="w-[95%] max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-headline text-[#293462]">
              {isForgotPassword ? "Khôi phục mật khẩu" : "Chào mừng bạn"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isForgotPassword ? "Nhập email để nhận liên kết đặt lại mật khẩu." : "Đăng nhập hoặc tạo tài khoản để tiếp tục."}
            </DialogDescription>
          </DialogHeader>
          
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              <Button type="submit" className="w-full h-12" disabled={isEmailLoading} style={{ backgroundColor: '#293462', color: 'white' }}>
                {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Gửi email khôi phục"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setIsForgotPassword(false)}>Quay lại</Button>
            </form>
          ) : (
            <>
              <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as "login" | "register")} className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg h-auto">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-[#293462] data-[state=active]:text-white data-[state=active]:font-bold font-medium text-slate-500 transition-all rounded-md py-2.5"
                  >
                    Đăng nhập
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-[#293462] data-[state=active]:text-white data-[state=active]:font-bold font-medium text-slate-500 transition-all rounded-md py-2.5"
                  >
                    Đăng ký
                  </TabsTrigger>
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
                        <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-[#6F2DBD] hover:underline font-medium">Quên mật khẩu?</button>
                      </div>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12" disabled={isEmailLoading} style={{ backgroundColor: '#293462', color: 'white' }}>
                      {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Đăng nhập"}
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
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm-password">Nhập lại mật khẩu</Label>
                      <div className="relative">
                        <Input id="reg-confirm-password" type={showConfirmPassword ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12" disabled={isEmailLoading} style={{ backgroundColor: '#6F2DBD', color: 'white' }}>
                      {isEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Tạo tài khoản"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Hoặc</span></div>
              </div>
              <Button variant="outline" type="button" disabled={isLoggingIn} onClick={handleGoogleLogin} className="w-full h-12">
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