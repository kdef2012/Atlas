
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { Loader2, ShieldCheck, Sparkles, Zap, Lock, CreditCard } from 'lucide-react';
import { activateAccount } from '@/actions/payments';
import { useToast } from '@/hooks/use-toast';

export default function PaywallPage() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading } = useDoc<User>(userRef);

  const handleActivate = async () => {
    if (!authUser) return;
    setIsProcessing(true);

    try {
      const result = await activateAccount(authUser.uid);
      if (result.success) {
        toast({ title: 'System Activated', description: result.message });
        router.push('/dashboard');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Activation Failed', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If user already paid, don't show the paywall
  if (user?.hasPaidAccess) {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-6 ring-4 ring-primary/5">
            <Lock className="w-12 h-12" />
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
            Signal Locked
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            ATLAS is a premium gamified environment. To prevent signal interference and ensure a high-fidelity experience for all citizens, a one-time activation fee is required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 flex flex-col items-center text-center">
            <ShieldCheck className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-bold text-sm">Full Access</h3>
            <p className="text-xs text-muted-foreground">Unlock all Nebula features forever.</p>
          </div>
          <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-accent mb-2" />
            <h3 className="font-bold text-sm">AI Forge</h3>
            <p className="text-xs text-muted-foreground">Unlimited high-fidelity character renders.</p>
          </div>
          <div className="bg-secondary/30 p-4 rounded-xl border border-primary/10 flex flex-col items-center text-center">
            <Zap className="w-8 h-8 text-yellow-400 mb-2" />
            <h3 className="font-bold text-sm">Starter Pack</h3>
            <p className="text-xs text-muted-foreground">Receive 5 bonus Gems on activation.</p>
          </div>
        </div>

        <Card className="border-primary/20 shadow-2xl shadow-primary/10 bg-card/50 backdrop-blur-md">
          <CardHeader className="text-center border-b bg-secondary/20">
            <CardTitle className="font-headline text-3xl">Nebula Activation</CardTitle>
            <CardDescription>Secure your place in the ATLAS</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1">One-Time Fee</span>
              <span className="text-6xl font-black font-headline tracking-tighter">$4.99</span>
              <span className="text-xs text-muted-foreground mt-2">Lifetime Access • No Subscriptions</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-8 pt-0">
            <Button 
              size="lg" 
              className="w-full h-16 text-xl font-bold group shadow-lg shadow-primary/20"
              onClick={handleActivate}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
              )}
              {isProcessing ? 'Processing Securely...' : 'Activate System'}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
              Secured by ATLAS Payment Core (Simulation Mode)
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
