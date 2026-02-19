"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, ShieldCheck, AlertCircle, PlayCircle, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function IntegrationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Gmail Listener</h2>
          <p className="text-muted-foreground">Connect your email to start listening for bank notifications.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <RefreshCw className="w-4 h-4 mr-2" /> Force Sync
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Mail className="text-accent w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Gmail API Connection</CardTitle>
                  <CardDescription>Status: <span className="text-green-600 font-bold">CONNECTED</span></CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active Listening</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Connected Email</Label>
                <Input disabled value="billing-notify@mycompany.com" className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Check Interval</Label>
                <div className="flex items-center gap-2">
                  <Input defaultValue="30" className="w-20" />
                  <span className="text-sm text-muted-foreground">seconds</span>
                </div>
              </div>
            </div>

            <div className="border p-4 rounded-lg bg-muted/20">
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4" /> Pattern Recognition
              </h4>
              <p className="text-sm text-muted-foreground mb-4">We are currently scanning for the following bank notification keywords:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white">"Transfer Receipt"</Badge>
                <Badge variant="outline" className="bg-white">"Received Funds"</Badge>
                <Badge variant="outline" className="bg-white">"Bank of America Notification"</Badge>
                <Badge variant="outline" className="bg-white">"Chase Bank Alert"</Badge>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]">+ Add Keyword</Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Disconnect Account</Button>
              <Button className="bg-accent">Save Settings</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Live Log Feed</CardTitle>
            <CardDescription>Real-time Gmail listener events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 font-mono text-xs">
              <div className="flex gap-2">
                <span className="text-muted-foreground">[12:45:01]</span>
                <span className="text-green-600">Scan completed. No new items.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">[12:44:30]</span>
                <span>Connecting to Gmail API...</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">[12:44:28]</span>
                <span className="text-accent font-bold">MATCH: Found transaction TX-8821 in Email.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">[12:44:28]</span>
                <span>Extracting fields: Amount=$50.0, Ref=ORD-123</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">[12:44:29]</span>
                <span className="text-blue-500">Triggering Webhook: Prod-App</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">[12:44:29]</span>
                <span className="text-green-600">Webhook response: 200 OK</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs h-8">View All Activity</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-accent text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" /> Test The Flow
            </CardTitle>
            <CardDescription className="text-white/70">Simulate a bank notification email to test your webhook integration.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/10 p-4 rounded-lg space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-white/80">Bank Name</Label>
                <Input defaultValue="Simulation Bank" className="bg-white/10 border-white/20 text-white h-8" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Amount</Label>
                  <Input defaultValue="100.00" className="bg-white/10 border-white/20 text-white h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-white/80">Ref Code</Label>
                  <Input defaultValue="TEST-REF-001" className="bg-white/10 border-white/20 text-white h-8" />
                </div>
              </div>
              <Button className="w-full bg-white text-accent hover:bg-white/90 font-bold">Send Mock Hook</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md flex flex-col justify-center p-8 bg-background border border-border">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secured by OAuth 2.0</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We never store your Gmail password. We use standard OAuth 2.0 to access only the metadata required to identify payment notification emails.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" /> Read-only access to specific labels
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
