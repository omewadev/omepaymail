import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="h-20 border-b border-border px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">P</div>
          <span className="font-headline font-bold text-xl text-primary">PayMailHook</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">Login</Link>
          <Button asChild className="bg-primary text-white">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-primary mb-6 tracking-tight">
          Automate Payments via <span className="text-accent">Gmail Hooks</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The bridge between your bank notifications and your application. Receive bank transfer emails, trigger instant webhooks, and confirm orders automatically.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" className="px-8 h-14 text-lg bg-accent hover:bg-accent/90" asChild>
            <Link href="/dashboard">
              Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 h-14 text-lg border-primary text-primary hover:bg-primary/5">
            Documentation
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-12">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Mail className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Gmail Listener</h3>
            <p className="text-muted-foreground">Real-time monitoring of your inbox for specific bank notification patterns using secure Gmail API.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
              <Zap className="text-accent w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Instant Webhooks</h3>
            <p className="text-muted-foreground">Automatically trigger POST requests to your server with extracted transaction data (amount, sender, ref).</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
              <ShieldCheck className="text-green-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold mb-3">Bank-Level Security</h3>
            <p className="text-muted-foreground">Encrypted logs and secure token management to ensure your financial data remains private and safe.</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border mt-20 text-center text-muted-foreground">
        <p>© 2024 PayMailHook Inc. Built for trust and speed.</p>
      </footer>
    </div>
  );
}
