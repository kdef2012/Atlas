
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { TwinskieAvatar } from "@/components/TwinskieAvatar";
import { StatsRadarChart } from "@/components/dashboard/StatsRadarChart";
import { LogActivityForm } from "@/components/dashboard/LogActivityForm";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { FireteamStatus } from "@/components/dashboard/FireteamStatus";
import { FirstQuest } from '@/components/dashboard/FirstQuest';
import { useDoc, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import type { Quest } from '@/lib/quest';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { MomentumFlame } from '@/components/dashboard/MomentumFlame';
import { TraitBadges } from '@/components/dashboard/TraitBadges';
import { SpotlightCard } from '@/components/dashboard/SpotlightCard';
import { RecruiterCard } from '@/components/dashboard/RecruiterCard';
import { useToast } from '@/hooks/use-toast';
import { verifySession } from '@/actions/payments';

function DashboardPageContent() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading } = useDoc<User>(userRef);
  
  const questsCollectionRef = useMemoFirebase(
      () => authUser ? collection(firestore, 'users', authUser.uid, 'quests') : null,
      [firestore, authUser]
  );
  const { data: quests, isLoading: areQuestsLoading } = useCollection<Quest>(questsCollectionRef);

  // ==========================================
  // MONETIZATION: Manual Verification Fallback
  // ==========================================
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');

    if (sessionId && (status === 'success' || status === 'activated') && user && !isVerifying) {
      // If the URL says success but the database hasn't updated yet, trigger manual verification
      const shouldVerify = (status === 'activated' && !user.hasPaidAccess) || (status === 'success');
      
      if (shouldVerify) {
        setIsVerifying(true);
        verifySession(sessionId).then((res) => {
          if (res.success) {
            toast({
              title: "Payment Fulfilled",
              description: "Your account has been updated. Welcome to the Nebula.",
            });
          }
        }).finally(() => setIsVerifying(false));
      }
    }
  }, [searchParams, user, isVerifying, toast]);

  if (isLoading || !user || areQuestsLoading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card className="flex flex-col items-center justify-center text-center p-6">
                  <CardHeader className="p-0 mb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                   <Skeleton className="w-48 h-72" />
                   <Skeleton className="h-10 w-full mt-4" />
                </Card>
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <Skeleton className="h-40 w-full" />
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
  
  const activeQuests = quests?.filter(q => !q.isCompleted).slice(0, 2) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        {isVerifying && (
          <Card className="bg-primary/5 border-primary/20 border-dashed animate-pulse">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="animate-spin text-primary h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-tighter">Synchronizing Payment Signal...</p>
            </CardContent>
          </Card>
        )}
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-headline text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Your Twinskie</CardTitle>
            <CardDescription>Your digital self.</CardDescription>
          </CardHeader>
          <TwinskieAvatar user={user} className="w-full max-w-xs" />
          <TraitBadges />
        </Card>
        <MomentumFlame />
        <FireteamStatus />
        <RecruiterCard />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <SpotlightCard />
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
                  {activeQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)}
                  <Button asChild variant="outline" className="w-full group">
                    <Link href="/quests">
                        View All Quests
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
              </CardContent>
            </Card>
        </div>
         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Live Resume</CardTitle>
            <CardDescription>Translate your ATLAS journey into a professional resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full group">
              <Link href="/resume">
                <FileText className="mr-2 h-4 w-4" />
                View Your Live Resume
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg-col-span-1 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-56 w-full" />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full" />
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
