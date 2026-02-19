"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, XCircle, Mail, Webhook as WebhookIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: 'Mon', total: 4000 },
  { name: 'Tue', total: 3000 },
  { name: 'Wed', total: 2000 },
  { name: 'Thu', total: 2780 },
  { name: 'Fri', total: 1890 },
  { name: 'Sat', total: 2390 },
  { name: 'Sun', total: 3490 },
];

const transactions = [
  { id: "TXN-101", customer: "John Doe", amount: "$150.00", method: "Bank Transfer", status: "Completed", date: "2 mins ago" },
  { id: "TXN-102", customer: "Jane Smith", amount: "$230.50", method: "Bank Transfer", status: "Pending", date: "15 mins ago" },
  { id: "TXN-103", customer: "Acme Corp", amount: "$1,200.00", method: "Wire", status: "Completed", date: "1 hour ago" },
  { id: "TXN-104", customer: "Robert Brown", amount: "$45.00", method: "Bank Transfer", status: "Failed", date: "3 hours ago" },
  { id: "TXN-105", customer: "Sarah Wilson", amount: "$89.99", method: "Bank Transfer", status: "Completed", date: "Yesterday" },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-80">Total Revenue</CardTitle>
            <CreditCard className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs mt-1 text-white/60">
              <span className="text-green-300 font-bold">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gmail Hooks</CardTitle>
            <Mail className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-accent font-bold">+12%</span> active triggers
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Webhooks Sent</CardTitle>
            <WebhookIcon className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,198</div>
            <p className="text-xs mt-1 text-muted-foreground">
              99.8% Success delivery rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Webhooks</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs mt-1 text-muted-foreground">
              Across 3 environments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Estimated revenue processed via email bank triggers.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={{fill: 'rgba(111, 45, 189, 0.1)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest bank transfers detected from Gmail.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.status === 'Completed' ? 'bg-green-100' : txn.status === 'Pending' ? 'bg-amber-100' : 'bg-red-100'}`}>
                      {txn.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : txn.status === 'Pending' ? <Clock className="w-5 h-5 text-amber-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{txn.customer}</p>
                      <p className="text-xs text-muted-foreground">{txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{txn.amount}</p>
                    <Badge variant={txn.status === 'Completed' ? 'default' : txn.status === 'Pending' ? 'secondary' : 'destructive'} className="text-[10px] h-5">
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detailed Log</CardTitle>
            <CardDescription>Comprehensive view of recent activities.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Webhook</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">{txn.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      Gmail
                    </div>
                  </TableCell>
                  <TableCell>{txn.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">Sent</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${txn.status === 'Completed' ? 'bg-green-500' : txn.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      {txn.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs font-bold text-accent hover:underline">View Details</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
