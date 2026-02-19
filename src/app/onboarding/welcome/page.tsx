
'use client';

import { Suspense, useEffect, useState } from 'react';
import { redirect, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Archetype } from '@/lib/types';
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { StatsRadarChart, StatsRadarChartSkeleton } from '@/components/dashboard/StatsRadarChart';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFirstQuest } from '@/ai/flows/generate-first-quest';

interface WelcomePageProps {}

function FirstQuestCard({ archetype }: { archetype: Archetype }) {
  const router = useRouter();
  const [quest, setQuest] = useState<{ name: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuest() {
      try {
        const result = await generateFirstQuest({ userArchetype: archetype });
        setQuest({ name: result.questName, description: result.questDescription });
      } catch (error) {
        console.error("AI Quest generation failed, using fallback:", error);
        setQuest({ 
          name: "Initial Calibration", 
          description: "Consume 8oz of water to initialize your Twinskie's hydration sensors." 
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

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-md p-12 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Synthesizing Initial Quest...</p>
        </motion.div>
      ) : (
        <motion.div
          key="quest"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Card className="w-full max-w-md border-accent neon-border">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-accent neon-text uppercase tracking-tight">
                QUEST RECEIVED: "{quest?.name}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Sparkles className="h-8 w-8 text-accent neon-icon mt-1" />
                <div>
                  <p className="text-muted-foreground leading-relaxed">{quest?.description}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 text-accent/80">Objective: Physical Interaction Required</p>
                </div>
              </div>
              <Button onClick={handleComplete} size="lg" className="w-full mt-6 font-bold group">
                I Have Completed This Task
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function WelcomePage({}: WelcomePageProps) {
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="text-center mb-12 relative z-10">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Current Status: <span className="text-muted-foreground">LEVEL 0</span></h1>
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-primary mt-2">Biological Signature Isolated</p>
      </div>
      
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl relative z-10">
        <div className="w-full max-w-md opacity-40 grayscale">
            <Suspense fallback={<StatsRadarChartSkeleton />}>
                <StatsRadarChart />
            </Suspense>
        </div>
        
        <FirstQuestCard archetype={archetype} />
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
          box-shadow: 0 0 15px hsl(var(--accent) / 0.2);
        }
      `}</style>
    </main>
  );
}
