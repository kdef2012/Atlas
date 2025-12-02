
'use client';

import { Suspense } from 'react';
import { redirect, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Archetype } from '@/lib/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { StatsRadarChart, StatsRadarChartSkeleton } from '@/components/dashboard/StatsRadarChart';
import { motion } from 'framer-motion';

interface WelcomePageProps {}

function FirstQuestCard({ archetype }: { archetype: Archetype }) {
  const router = useRouter();

  const handleClaim = () => {
    // Redirect to a dedicated camera page to claim the quest
    router.push(`/claim-quest?quest=elixir-of-life&archetype=${archetype}`);
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
    >
      <Card className="w-full max-w-md border-accent neon-border">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent neon-text">QUEST RECEIVED: "The Elixir of Life"</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <CheckCircle2 className="h-8 w-8 text-accent neon-icon mt-1" />
            <div>
              <p className="text-muted-foreground">Your avatar is dehydrated. Consume 8oz of water to restore vitality.</p>
              <p className="text-sm font-bold mt-2">Reward: +50 XP / +10 Health</p>
            </div>
          </div>
          <Button onClick={handleClaim} size="lg" className="w-full mt-6 font-bold group">
            Open Camera to Claim
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}


export default function WelcomePage({}: WelcomePageProps) {
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
        
        <Suspense>
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
