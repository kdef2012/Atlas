
'use client';

import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useDoc, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { COSMETIC_ITEMS } from '@/lib/avatar-system-openpeeps';
import { Loader2, ShoppingBag, Check, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useMemoFirebase } from '@/firebase/provider';

export default function ProfilePage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: userData, isLoading: isDocLoading } = useDoc<User>(userDocRef);

  const isLoading = isAuthLoading || isDocLoading;

  if (isLoading || !userData || !authUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const activeCosmetics = userData.avatarLayers || {};
  const userGems = userData.gems || 0;

  const toggleCosmetic = async (itemId: string) => {
    if (!userDocRef) return;

    const isActive = activeCosmetics[itemId];
    
    updateDocumentNonBlocking(userDocRef, {
      [`avatarLayers.${itemId}`]: !isActive,
    });

    toast({
      title: isActive ? 'Item Unequipped' : 'Item Equipped',
      description: isActive 
        ? 'The item has been removed from your Twinskie' 
        : 'The item is now visible on your Twinskie',
    });
  };

  const purchaseCosmetic = async (item: typeof COSMETIC_ITEMS[0]) => {
    if (!userDocRef || !item.costGems) return;
    
    if (userGems < item.costGems) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Gems',
        description: `You need ${item.costGems} gems but only have ${userGems}.`,
      });
      return;
    }

    setPurchasingItem(item.id);

    // Deduct gems and unlock item
    updateDocumentNonBlocking(userDocRef, {
      gems: userGems - item.costGems,
      [`avatarLayers.${item.id}`]: true,
    });

    setTimeout(() => {
      toast({
        title: 'Item Purchased!',
        description: `${item.name} has been added to your Twinskie.`,
      });
      setPurchasingItem(null);
    }, 500);
  };

  const isItemUnlocked = (item: typeof COSMETIC_ITEMS[0]): boolean => {
    if (activeCosmetics[item.id] !== undefined) return true;
    if (!item.requirement) return false;

    // Check requirements
    if (item.requirement.type === 'level') {
      return userData.level >= (item.requirement.value as number);
    }
    if (item.requirement.type === 'trait') {
      return userData.traits?.[item.requirement.value as string] || false;
    }
    
    return false;
  };

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Twinskie Display */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">{userData.userName}</CardTitle>
              <CardDescription>
                Level {userData.level} {userData.archetype}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <TwinskieAvatar user={userData} size="xl" />
              
              <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="font-bold">{userData.xp} / {(userData.level + 1) * 100}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(userData.xp / ((userData.level + 1) * 100)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{userGems}</span>
                <span className="text-muted-foreground">Gems</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Cosmetics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>Your skill progression across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Physical', value: userData.physicalStat, color: 'bg-red-500' },
                  { name: 'Mental', value: userData.mentalStat, color: 'bg-blue-500' },
                  { name: 'Social', value: userData.socialStat, color: 'bg-purple-500' },
                  { name: 'Practical', value: userData.practicalStat, color: 'bg-green-500' },
                  { name: 'Creative', value: userData.creativeStat, color: 'bg-yellow-500' },
                ].map((stat) => (
                  <div key={stat.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{stat.name}</span>
                      <span className="text-sm font-bold">{stat.value}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`${stat.color} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cosmetics Wardrobe */}
          <Card>
            <CardHeader>
              <CardTitle>Wardrobe</CardTitle>
              <CardDescription>Customize your Twinskie with cosmetic items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COSMETIC_ITEMS.map((item) => {
                  const isUnlocked = isItemUnlocked(item);
                  const isActive = activeCosmetics[item.id] || false;
                  const isOwned = activeCosmetics[item.id] !== undefined;
                  const canPurchase = item.costGems && userGems >= item.costGems;

                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 space-y-3 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                        </div>
                      </div>

                      {isOwned ? (
                        <Button
                          onClick={() => toggleCosmetic(item.id)}
                          variant={isActive ? 'default' : 'outline'}
                          className="w-full"
                        >
                          {isActive ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Equipped
                            </>
                          ) : (
                            'Equip'
                          )}
                        </Button>
                      ) : isUnlocked && item.requirement ? (
                        <Button
                          onClick={() => toggleCosmetic(item.id)}
                          variant="secondary"
                          className="w-full"
                        >
                          Unlock & Equip
                        </Button>
                      ) : item.costGems ? (
                        <Button
                          onClick={() => purchaseCosmetic(item)}
                          disabled={!canPurchase || purchasingItem === item.id}
                          className="w-full"
                        >
                          {purchasingItem === item.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 mr-2" />
                          )}
                          {canPurchase ? `Buy ${item.costGems} gems` : `Need ${item.costGems} gems`}
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
