
'use client';

import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser, useDoc, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { COSMETIC_ITEMS, getActiveCosmetics, combineCosmeticEffects } from '@/lib/avatar-cosmetics';
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

  const userGems = userData.gems || 0;

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
              <TwinskieAvatar user={userData} size="sm" />
              
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

        {/* Right Column - Stats */}
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
        </div>
      </div>
    </main>
  );
}
