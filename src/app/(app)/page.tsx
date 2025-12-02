

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { TwinskieAvatar } from "@/components/dashboard/TwinskieAvatar";
import { StatsRadarChart } from "@/components/dashboard/StatsRadarChart";
import { LogActivityForm } from "@/components/dashboard/LogActivityForm";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { FireteamStatus } from "@/components/dashboard/FireteamStatus";
import { FirstQuest } from '@/components/dashboard/FirstQuest';
import { useDoc, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { MomentumFlame } from '@/components/dashboard/MomentumFlame';
import { TraitBadges } from '@/components/dashboard/TraitBadges';

function DashboardPageContent() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading } = useDoc<User>(userRef);

  if (isLoading || !user) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card className="flex flex-col items-center justify-center text-center p-6">
                  <CardHeader className="p-0 mb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                   <Skeleton className="w-48 h-48 rounded-full" />
                   <Skeleton className="h-10 w-full mt-4" />
                </Card>
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-60 w-full" />
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Quest Log</CardTitle>
                            <CardDescription>Your current objectives.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  const isInactive = user.lastLogTimestamp ? (Date.now() - user.lastLogTimestamp) > (24 * 60 * 60 * 1000) : false;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-headline text-3xl">The Twinskie</CardTitle>
            <CardDescription>Your digital self.</CardDescription>
          </CardHeader>
          <TwinskieAvatar isInactive={isInactive} />
          <TraitBadges />
        </Card>
        <MomentumFlame />
        <FireteamStatus />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Core Energies</CardTitle>
            <CardDescription>A reflection of your life's balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="mx-auto aspect-square h-[300px] rounded-full" />}>
              <StatsRadarChart />
            </Suspense>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Log Activity</CardTitle>
                    <CardDescription>What have you accomplished?</CardDescription>
                </CardHeader>
                <CardContent>
                    <LogActivityForm />
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="font-headline">Quest Log</CardTitle>
                  <CardDescription>A glimpse of your objectives.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <FirstQuest />
                  <QuestCard 
                    quest={{ 
                      id: 'q2', 
                      name: 'Pioneer: First Steps', 
                      description: 'Log a new, unique skill that doesn\'t exist in the ATLAS yet.',
                      category: 'Creative',
                      isCompleted: false // This would be dynamic
                    }}
                  />
                  <Button asChild variant="outline" className="w-full group">
                    <Link href="/quests">
                        View All Quests
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-60 w-full" />
                    <div className="space-y-6">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        </div>
        }>
            <DashboardPageContent />
        </Suspense>
    )
}

    