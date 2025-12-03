
'use client';

import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TwinskieAvatar } from "@/components/dashboard/TwinskieAvatar";
import { StatsRadarChart, StatsRadarChartSkeleton } from "@/components/dashboard/StatsRadarChart";
import { TraitBadges } from "@/components/dashboard/TraitBadges";
import { useDoc, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MomentumFlame } from '@/components/dashboard/MomentumFlame';
import { FireteamStatus } from '@/components/dashboard/FireteamStatus';

function ProfilePageContent() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const isLoading = isAuthLoading || isUserDocLoading;

  if (isLoading || !user) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="md:col-span-1 space-y-6">
                <Card className="flex flex-col items-center justify-center text-center p-6">
                  <CardHeader className="p-0 mb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                   <Skeleton className="w-48 h-48 rounded-lg" />
                   <Skeleton className="h-10 w-full mt-4" />
                </Card>
                <Skeleton className="h-40 w-full" />
            </div>
            <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
        </div>
    );
  }

  const isInactive = user.lastLogTimestamp ? (Date.now() - user.lastLogTimestamp) > (24 * 60 * 60 * 1000) : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {/* Left Column: Avatar and Core Info */}
      <div className="md:col-span-1 space-y-6">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-headline text-3xl">{user.userName}</CardTitle>
            <CardDescription>{user.archetype} / Level {user.level}</CardDescription>
          </CardHeader>
          <TwinskieAvatar isInactive={isInactive} />
          <TraitBadges />
        </Card>
        <MomentumFlame />
      </div>

      {/* Right Column: Stats and Status */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Core Energies</CardTitle>
            <CardDescription>A reflection of your life's balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<StatsRadarChartSkeleton />}>
              <StatsRadarChart />
            </Suspense>
          </CardContent>
        </Card>
        <FireteamStatus />
      </div>
    </div>
  );
}

export default function ProfileExamplePage() {
    return (
        <div className="p-4 md:p-8">
            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <div className="md:col-span-1 space-y-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-56 w-full" />
                    </div>
                </div>
            }>
                <ProfilePageContent />
            </Suspense>
        </div>
    )
}
