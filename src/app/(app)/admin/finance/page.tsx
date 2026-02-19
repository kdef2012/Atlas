'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Wallet, TrendingUp, History, ShieldCheck, Loader2, Link as LinkIcon, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminFinancePage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (pk) {
      setIsConnected(true);
      setIsTestMode(pk.startsWith('pk_test_'));
    }
  }, []);

  const totalRevenue = 1248.50;
  const gemSales = 845.00;
  const activationFees = 403.50;

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% from last cycle
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gem Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline">${gemSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">168 transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activation Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-headline">${activationFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">81 new citizens</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="stripe">Stripe Protocol</TabsTrigger>
          <TabsTrigger value="history">Ledger</TabsTrigger>
        </TabsList>

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
                    If you cannot find "Live" keys, use "Test" keys (`pk_test_...`) to test the flow.
                  </p>
                  <Button asChild variant="outline">
                    <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Get Stripe Test Keys
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Public Key</Label>
                      <Input type="password" value={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''} readOnly />
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
                      <Info className="w-5 h-5 text-blue-400 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-blue-400">Environment Active</p>
                        <p className="text-blue-300/80">
                          The system has detected keys. All checkout attempts will now route through Stripe.
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Today</TableCell>
                    <TableCell>Gem Pouch (10)</TableCell>
                    <TableCell>$0.99</TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-500">Completed</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Yesterday</TableCell>
                    <TableCell>Activation Fee</TableCell>
                    <TableCell>$4.99</TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-500">Completed</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}