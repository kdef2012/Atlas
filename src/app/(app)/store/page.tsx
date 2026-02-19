
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useUser, useMemoFirebase, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, increment } from 'firebase/firestore';
import type { User, StoreItem } from '@/lib/types';
import { Gem, Check, Loader2, Store, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CATEGORY_ICONS, STORE_ITEM_ICONS } from '@/lib/types';
import { purchaseGems } from '@/actions/payments';

const GEM_PACKAGES = [
  { id: 'pouch', name: 'Gem Pouch', amount: 10, price: 0.99, icon: Gem },
  { id: 'bag', name: 'Gem Bag', amount: 55, price: 4.99, icon: Sparkles, badge: 'BEST VALUE' },
  { id: 'chest', name: 'Gem Chest', amount: 120, price: 9.99, icon: TrendingUp },
];

function GemPackageCard({ pkg, onPurchase, isProcessing }: { pkg: any, onPurchase: (pkg: any) => void, isProcessing: boolean }) {
  const Icon = pkg.icon;
  return (
    <Card className="relative flex flex-col border-primary/10 bg-secondary/20 overflow-hidden group">
      {pkg.badge && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent text-[8px] font-black uppercase tracking-widest rounded-sm">
          {pkg.badge}
        </div>
      )}
      <CardHeader className="text-center p-4 pb-2">
        <div className="mx-auto p-3 rounded-full bg-primary/5 text-primary mb-2 group-hover:scale-110 transition-transform">
          <Icon className="w-8 h-8" />
        </div>
        <CardTitle className="text-base">{pkg.name}</CardTitle>
        <CardDescription className="text-xl font-black text-primary">
          {pkg.amount} Gems
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all"
          disabled={isProcessing}
          onClick={() => onPurchase(pkg)}
        >
          {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : `$${pkg.price}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

function StoreItemCard({ item, userGems, userOwnedCosmetics, onPurchase }: { item: StoreItem, userGems: number, userOwnedCosmetics: Record<string, boolean>, onPurchase: (item: any) => void }) {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { toast } = useToast();

    const hasItem = userOwnedCosmetics[item.layerKey];
    const canAfford = userGems >= item.price;
    
    const ItemIcon = STORE_ITEM_ICONS[item.icon] || Store;

    const handlePurchase = () => {
        setIsPurchasing(true);
        onPurchase(item);
        setTimeout(() => {
             toast({
                title: 'Purchase Successful!',
                description: `You have acquired the ${item.name}. It has been auto-equipped!`,
            });
            setIsPurchasing(false);
        }, 1500);
    }
    
    return (
        <Card className={cn("flex flex-col", hasItem && "bg-secondary/50 border-accent/20")}>
            <CardHeader className="text-center">
                <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-2">
                    <ItemIcon className="w-10 h-10" />
                </div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription className="text-xs">{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <div className="flex items-center gap-2 text-2xl font-bold font-headline">
                    <Gem className="w-6 h-6 text-accent" />
                    <span>{item.price}</span>
                </div>
            </CardContent>
            <CardFooter>
                 {hasItem ? (
                    <Button disabled className="w-full" variant="outline"><Check className="mr-2"/> Owned</Button>
                ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button className="w-full" disabled={!canAfford || isPurchasing}>
                                {isPurchasing ? <Loader2 className="mr-2 animate-spin"/> : 'Purchase'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to spend {item.price} Gems to acquire the {item.name}? This action is irreversible.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePurchase} className="bg-primary hover:bg-primary/90">
                                Confirm Purchase
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardFooter>
        </Card>
    )
}


export default function StorePage() {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    const { toast } = useToast();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

    const storeItemsCollection = useMemoFirebase(() => collection(firestore, 'store-items'), [firestore]);
    const { data: storeItems, isLoading: areItemsLoading } = useCollection<StoreItem>(storeItemsCollection);

    const isLoading = isAuthLoading || isUserDocLoading || areItemsLoading;

    const handlePurchaseItem = (item: StoreItem) => {
        if (!userRef || !user) return;

        const updates = {
            gems: increment(-item.price),
            [`ownedCosmetics.${item.layerKey}`]: true,
            [`avatarLayers.${item.layerKey}`]: true, 
        };

        updateDocumentNonBlocking(userRef, updates);
    };

    const handleBuyGems = async (pkg: typeof GEM_PACKAGES[0]) => {
      if (!authUser) return;
      setIsProcessingPayment(true);
      
      try {
        const result = await purchaseGems(authUser.uid, pkg.amount, pkg.price);
        if (result.success) {
          toast({ title: 'Payment Confirmed', description: result.message });
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Payment Failed', description: error instanceof Error ? error.message : 'Unknown' });
      } finally {
        setIsProcessingPayment(false);
      }
    };

    if (isLoading || !user) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
        )
    }

    const StoreIcon = CATEGORY_ICONS['Store'];

    return (
        <div className="space-y-8 pb-12">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                           <StoreIcon className="w-8 h-8 text-primary"/>
                            ATLAS Exchange
                        </CardTitle>
                        <CardDescription>Trade Gems for high-fidelity character modifications.</CardDescription>
                    </div>
                     <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-3xl font-black font-headline bg-card p-3 px-6 rounded-2xl border border-primary/20 shadow-xl">
                            <Gem className="w-8 h-8 text-accent animate-pulse" />
                            <span>{user.gems}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Available Balance</span>
                    </div>
                </CardHeader>
            </Card>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-2xl font-bold tracking-tight">Purchase Gems</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {GEM_PACKAGES.map(pkg => (
                  <GemPackageCard 
                    key={pkg.id} 
                    pkg={pkg} 
                    onPurchase={handleBuyGems} 
                    isProcessing={isProcessingPayment} 
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shirt className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-2xl font-bold tracking-tight">Cosmetic Cache</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storeItems?.map(item => (
                      <StoreItemCard 
                          key={item.id} 
                          item={item} 
                          userGems={user.gems} 
                          userOwnedCosmetics={user.ownedCosmetics || {}}
                          onPurchase={handlePurchaseItem}
                      />
                  ))}
                  {(!storeItems || storeItems.length === 0) && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl opacity-50">
                      <p className="text-muted-foreground">The cache is currently empty. Check back for new AI-synthesized items.</p>
                    </div>
                  )}
              </div>
            </section>
        </div>
    );
}
