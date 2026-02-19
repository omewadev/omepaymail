"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Webhook, Plus, Trash2, Send, ExternalLink, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Production App", url: "https://api.myapp.com/v1/payments/webhook", active: true, events: ["Payment Received", "Email Detected"] },
    { id: 2, name: "Staging/Dev", url: "https://staging.myapp.com/webhooks", active: false, events: ["Payment Received"] },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Webhooks</h2>
          <p className="text-muted-foreground">Manage your endpoint URLs for real-time payment notifications.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" /> Add New Endpoint
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {webhooks.map((hook) => (
          <Card key={hook.id} className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-accent" />
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{hook.name}</CardTitle>
                  <Badge variant={hook.active ? "default" : "secondary"}>
                    {hook.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> {hook.url}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={hook.active} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hook.events.map(event => (
                  <Badge key={event} variant="outline" className="bg-secondary/50 text-accent border-accent/20">
                    {event}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t flex justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Send className="w-4 h-4 mr-2" /> Test Webhook
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Shield className="w-4 h-4 mr-2" /> Secret Key
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2 bg-transparent">
        <CardHeader>
          <CardTitle className="text-center text-muted-foreground">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 font-bold">1</div>
            <h4 className="font-bold">Register URL</h4>
            <p className="text-sm text-muted-foreground">Add your server's endpoint to receive POST data.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 font-bold">2</div>
            <h4 className="font-bold">Verify Signature</h4>
            <p className="text-sm text-muted-foreground">Use the secret key provided to verify the authenticity of requests.</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 font-bold">3</div>
            <h4 className="font-bold">Handle Payloads</h4>
            <p className="text-sm text-muted-foreground">Process the transaction JSON sent to your server immediately.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
