import { Badge } from "@/components/ui/badge";

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, TrendingUp, History, Link as LinkIcon, ExternalLink, AlertCircle, Info, DollarSign, Gem, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AdminFinancePage() {
  const [isTestMode, setIsTestMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (pk && pk.startsWith('pk_')) {
      setIsConnected(true);
      setIsTestMode(pk.startsWith('pk_test_'));
    }
  }, []);

  const transactionsQuery = useMemoFirebase(() => 
    query(collection(firestore, 'transactions'), orderBy('timestamp', 'desc'), limit(50)),
    [firestore]
  );
  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const stats = useMemo(() => {
    if (!transactions) return { totalRevenue: 0, gemSales: 0, activationFees: 0 };
    return transactions.reduce((acc, t) => {
        acc.totalRevenue += t.price;
        if (t.type === 'gem_purchase') acc.gemSales += t.price;
        if (t.type === 'account_activation') acc.activationFees += t.price;
        return acc;
    }, { totalRevenue: 0, gemSales: 0, activationFees: 0 });
  }, [transactions]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" />
            Finance & Payments
          </CardTitle>
          <CardDescription>
            Oversee the ATLAS economy and manage Stripe protocols.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Live Signal Active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Gem Purchases</CardTitle>
            <Gem className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline">${stats.gemSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Direct Synthesis Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Activation Fees</CardTitle>
            <UserCheck className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline">${stats.activationFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Citizen Onboarding Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="history">Live Ledger</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
              <CardDescription>Real-time ledger of all user transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {transactions?.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs">{format(t.timestamp, 'MM/dd HH:mm')}</TableCell>
                            <TableCell className="font-mono text-xs truncate max-w-[100px]">{t.userId}</TableCell>
                            <TableCell className="capitalize">{t.type.replace('_', ' ')}</TableCell>
                            <TableCell className="font-bold">${t.price.toFixed(2)}</TableCell>
                            <TableCell><Badge className="bg-green-500/10 text-green-500">Verified</Badge></TableCell>
                        </TableRow>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                                No transactions detected in the signal.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <Card className={cn("border-primary/20", isTestMode && "border-yellow-500/50 bg-yellow-500/5")}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-500" />
                  Stripe Connection
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? `Connected in ${isTestMode ? 'TEST' : 'LIVE'} mode.` 
                    : 'System is currently in Simulation Mode (No Keys detected).'}
                </CardDescription>
              </div>
              {isConnected ? (
                <Badge className={cn(isTestMode ? "bg-yellow-500 text-black" : "bg-green-500 text-white")}>
                  {isTestMode ? "Test Mode" : "Live Mode"}
                </Badge>
              ) : (
                <Badge variant="secondary">Simulation</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected ? (
                <div className="p-6 rounded-xl border-2 border-dashed bg-secondary/10 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-bold">Stripe Keys Required</h3>
                  <p className="max-w-md mx-auto text-sm text-muted-foreground mt-2 mb-6">
                    To process real payments, add your Stripe API keys to the environment. 
                  </p>
                  <Button asChild variant="outline">
                    <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get Stripe Keys
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Public Key (Redacted)</Label>
                      <Input type="password" value="************************" readOnly />
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
                      <Info className="w-5 h-5 text-blue-400 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-blue-400">Signal Strong</p>
                        <p className="text-blue-300/80">
                          The system has detected keys. All checkout attempts are routing through your production Stripe account.
                          {isTestMode && " You are currently in TEST MODE. Real money will not be charged."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
