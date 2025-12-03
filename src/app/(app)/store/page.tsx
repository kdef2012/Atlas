
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc, increment } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Gem, Check, Loader2, Store, Glasses, RectangleHorizontal, Shield } from 'lucide-react';
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
import { CATEGORY_ICONS } from '@/lib/types';
import storeItemsData from '@/lib/store-items.json';

// A map to dynamically select icons
const iconMap = {
    RectangleHorizontal,
    Glasses,
    Shield,
};

// Define a more specific type for our store items
interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: keyof typeof iconMap;
    layerKey: string;
}

const STORE_ITEMS: StoreItem[] = storeItemsData.items as StoreItem[];

function StoreItemCard({ item, userGems, userLayers, onPurchase }: { item: StoreItem, userGems: number, userLayers: Record<string, boolean>, onPurchase: (item: any) => void }) {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { toast } = useToast();

    const hasItem = userLayers[item.layerKey];
    const canAfford = userGems >= item.price;
    
    const ItemIcon = iconMap[item.icon] || Store;


    const handlePurchase = () => {
        setIsPurchasing(true);
        onPurchase(item);
        // The onPurchase function will handle updating the user doc, which will re-render this component.
        // We'll add a small delay to simulate processing and prevent spam-clicking.
        setTimeout(() => {
             toast({
                title: 'Purchase Successful!',
                description: `You have acquired the ${item.name}.`,
            });
            setIsPurchasing(false);
        }, 1500);
    }
    
    return (
        <Card className={cn("flex flex-col", hasItem && "bg-secondary/50")}>
            <CardHeader className="text-center">
                <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit mb-2">
                    <ItemIcon className="w-10 h-10" />
                </div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
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
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

    const isLoading = isAuthLoading || isUserDocLoading;

    const handlePurchase = (item: StoreItem) => {
        if (!userRef || !user) return;

        const updates = {
            gems: increment(-item.price),
            [`avatarLayers.${item.layerKey}`]: true,
        };

        updateDocumentNonBlocking(userRef, updates);
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
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                           <StoreIcon className="w-8 h-8 text-primary"/>
                            Digital Goods Store
                        </CardTitle>
                        <CardDescription>Use your hard-earned Gems to acquire new cosmetic items for your Twinskie.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 text-xl font-bold font-headline bg-secondary p-2 rounded-md">
                        <Gem className="w-6 h-6 text-accent" />
                        <span>{user.gems}</span>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STORE_ITEMS.map(item => (
                    <StoreItemCard 
                        key={item.id} 
                        item={item} 
                        userGems={user.gems} 
                        userLayers={user.avatarLayers as Record<string, boolean> || {}}
                        onPurchase={handlePurchase}
                    />
                ))}
            </div>
        </div>
    );
}
