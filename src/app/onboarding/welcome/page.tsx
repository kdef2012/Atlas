
import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { generateFirstQuest, type GenerateFirstQuestInput } from '@/ai/flows/generate-first-quest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Archetype } from '@/lib/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WelcomePageProps {
  searchParams: {
    archetype?: Archetype;
  };
}

async function FirstQuestCard({ archetype }: { archetype: Archetype }) {
  // Per design doc, the first quest is fixed to be simple.
  const quest = {
      questName: 'Drink a glass of water',
      questDescription: 'Hydration is key to life. Complete this simple task to begin your journey.'
  };

  return (
    <Card className="w-full max-w-md border-accent neon-border">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-accent neon-text">Your First Quest</CardTitle>
        <CardDescription>Complete this to begin your journey and claim your first reward.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <CheckCircle2 className="h-8 w-8 text-accent neon-icon mt-1" />
          <div>
            <h3 className="font-bold text-lg">{quest.questName}</h3>
            <p className="text-muted-foreground">{quest.questDescription}</p>
          </div>
        </div>
        <p className="text-xs text-center mt-4 text-muted-foreground">This quest is auto-verified for your convenience.</p>
        <Button asChild size="lg" className="w-full mt-6 font-bold group">
          <Link href={`/onboarding/reward?archetype=${archetype}`}>
            I Did It! Claim Reward
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function FirstQuestCardSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-12 w-full mt-8" />
      </CardContent>
    </Card>
  );
}


export default function WelcomePage({ searchParams }: WelcomePageProps) {
  const { archetype } = searchParams;

  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Welcome, {archetype}</h1>
        <p className="text-lg text-muted-foreground mt-2">Your adventure starts now. But first, a simple task.</p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-4xl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Current Status</CardTitle>
            <CardDescription>A blank slate, ready to be forged.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Level</span>
              <span className="font-headline text-3xl font-bold text-primary">0</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">Title</span>
              <span className="font-bold text-lg text-muted-foreground/80 italic">Novice</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-muted-foreground">XP</span>
              <span className="font-bold text-lg">0 / 100</span>
            </div>
             <p className="text-xs text-center pt-4 text-muted-foreground animate-pulse">This is where your journey begins. Every great story has a humble start.</p>
          </CardContent>
        </Card>
        
        <Suspense fallback={<FirstQuestCardSkeleton />}>
          <FirstQuestCard archetype={archetype} />
        </Suspense>
      </div>
    </main>
  );
}
