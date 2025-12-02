
'use client';

import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TwinskieAvatar } from "@/components/dashboard/TwinskieAvatar";
import { StatsRadarChart, StatsRadarChartSkeleton } from "@/components/dashboard/StatsRadarChart";
import { LogActivityForm } from "@/components/dashboard/LogActivityForm";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { FireteamStatus } from "@/components/dashboard/FireteamStatus";
import { FirstQuest } from '@/components/dashboard/FirstQuest';
import { useDoc, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardPageContent() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const userRef = authUser ? doc(firestore, 'users', authUser.uid) : null;
  const { data: user, isLoading } = useDoc<User>(userRef);

  if (isLoading || !user) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-80 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    );
  }

  const isInactive = (Date.now() - user.lastLogTimestamp) > (24 * 60 * 60 * 1000);
  const dominantCategory = Object.keys(user)
    .filter(key => key.endsWith('Stat'))
    .reduce((a, b) => user[a as keyof User] > user[b as keyof User] ? a : b)
    .replace('Stat', '')
    .replace(/^\w/, c => c.toUpperCase()) as any;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-headline text-3xl">The Twinskie</CardTitle>
            <CardDescription>Your digital self.</CardDescription>
          </CardHeader>
          <TwinskieAvatar dominantCategory={dominantCategory} isInactive={isInactive} />
        </Card>
        <FireteamStatus />
      </div>

      <div className="lg:col-span-2 space-y-6">
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

            <div className="space-y-6">
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
               <QuestCard 
                quest={{ 
                  id: 'q3', 
                  name: 'Social Bond', 
                  description: 'Join or create a Fireteam.',
                  category: 'Social',
                  isCompleted: false // This would be dynamic
                }}
              />
            </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardPageContent />
        </Suspense>
    )
}
