
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Wallet, TrendingUp, History, ShieldCheck, Loader2, Link as LinkIcon, ExternalLink, AlertCircle } from 'lucide-react';
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
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  // Simulated stats
  const totalRevenue = 1248.50;
  const gemSales = 845.00;
  const activationFees = 403.50;

  const handleConnectStripe = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast({
        title: "Stripe Connected",
        description: "Your account is now ready to receive payments from the ATLAS system.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary" />
            Finance & Payments
          </CardTitle>
          <CardDescription>
            Manage your Stripe integration and oversee the ATLAS economy.
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
              <TrendingUp className="w-3 h-3" /> +12% from last month
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
          <TabsTrigger value="stripe">Stripe Config</TabsTrigger>
          <TabsTrigger value="history">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-500" />
                  Stripe Connection
                </CardTitle>
                <CardDescription>Connect ATLAS to your bank account via Stripe Connect.</CardDescription>
              </div>
              {isConnected ? (
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="secondary">Disconnected</Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-secondary/10">
                  <CreditCard className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-xl font-bold">Collect Real Payments</h3>
                  <p className="max-w-md text-muted-foreground mt-2 mb-6">
                    Connect your Stripe account to start accepting real currency for Gem purchases and account activations.
                  </p>
                  <Button size="lg" onClick={handleConnectStripe} disabled={isConnecting}>
                    {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                    Connect with Stripe
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pk">Stripe Public Key</Label>
                      <Input id="pk" type="password" value="pk_test_************************" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sk">Stripe Secret Key</Label>
                      <Input id="sk" type="password" value="sk_test_************************" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wh">Webhook Secret</Label>
                      <Input id="wh" type="password" value="whsec_************************" readOnly />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="text-sm">
                      <p className="font-bold text-blue-400">Production Mode Tip</p>
                      <p className="text-blue-300/80">
                        In a live environment, these keys should be stored in your server environment variables (.env). 
                        The ATLAS Payment Core will automatically use these to secure your transactions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {isConnected && (
              <CardFooter className="border-t pt-6">
                <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                  Disconnect Account
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>A ledger of all financial activity in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Feb 24, 2024</TableCell>
                    <TableCell>Gem Pouch (10 Gems)</TableCell>
                    <TableCell>$0.99</TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-500">Succeeded</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">ch_3Olj...</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Feb 24, 2024</TableCell>
                    <TableCell>Account Activation</TableCell>
                    <TableCell>$4.99</TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-500">Succeeded</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">ch_3Olj...</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Feb 23, 2024</TableCell>
                    <TableCell>Gem Bag (55 Gems)</TableCell>
                    <TableCell>$4.99</TableCell>
                    <TableCell><Badge className="bg-green-500/10 text-green-500">Succeeded</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">ch_3Oli...</TableCell>
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
