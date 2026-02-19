
'use client';

import { Suspense, useState, useEffect } from 'react';
import { redirect, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Archetype } from '@/lib/types';
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { StatsRadarChart, StatsRadarChartSkeleton } from '@/components/dashboard/StatsRadarChart';
import { motion } from 'framer-motion';
import { generateFirstQuest } from '@/ai/flows/generate-first-quest';

interface WelcomePageProps {}

function FirstQuestCard({ archetype }: { archetype: Archetype }) {
  const router = useRouter();
  const [quest, setQuest] = useState<{name: string, description: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuest() {
      try {
        const result = await generateFirstQuest({ userArchetype: archetype });
        setQuest({ name: result.questName, description: result.questDescription });
      } catch (error) {
        console.error("Failed to generate first quest:", error);
        setQuest({ 
          name: "The Elixir of Life", 
          description: "Your avatar is dehydrated. Consume 8oz of water to restore vitality." 
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuest();
  }, [archetype]);

  const handleComplete = () => {
    router.push(`/onboarding/reward?archetype=${archetype}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md border-primary/20 bg-card/50">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-mono animate-pulse">AUTHORING INITIAL OBJECTIVE...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
    >
      <Card className="w-full max-w-md border-accent neon-border">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Quest Received</span>
          </div>
          <CardTitle className="font-headline text-2xl text-accent neon-text">
            {quest?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="h-8 w-8 text-accent neon-icon mt-1" />
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {quest?.description}
              </p>
              <div className="mt-4 flex gap-3">
                <div className="bg-primary/10 px-2 py-1 rounded text-[10px] font-bold text-primary border border-primary/20">+50 XP</div>
                <div className="bg-accent/10 px-2 py-1 rounded text-[10px] font-bold text-accent border border-accent/20">LEVEL UP</div>
              </div>
            </div>
          </div>
          <Button onClick={handleComplete} size="lg" className="w-full mt-6 font-bold group">
            Complete Quest
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WelcomePageContent() {
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Current Status: <span className="text-muted-foreground">LEVEL 0</span></h1>
      </div>
      
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <div className="w-full max-w-md opacity-50 grayscale">
            <Suspense fallback={<StatsRadarChartSkeleton />}>
                <StatsRadarChart />
            </Suspense>
        </div>
        
        <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin text-primary" />}>
          <FirstQuestCard archetype={archetype} />
        </Suspense>
      </div>
      <style jsx>{`
        .neon-text {
          text-shadow:
            0 0 5px hsl(var(--accent)),
            0 0 10px hsl(var(--accent));
        }
        .neon-icon {
          filter: drop-shadow(0 0 4px hsl(var(--accent)));
        }
        .neon-border {
          border-color: hsl(var(--accent) / 0.5);
          box-shadow: 0 0 8px hsl(var(--accent) / 0.5);
        }
      `}</style>
    </main>
  );
}

export default function WelcomePage({}: WelcomePageProps) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <WelcomePageContent />
    </Suspense>
  );
}
