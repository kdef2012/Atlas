
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Box, Gem, ShieldCheck, Sparkles } from 'lucide-react';
import type { Archetype } from '@/lib/types';

interface RewardPageProps {
  searchParams: {
    archetype?: Archetype;
  };
}

function LootBox() {
    return (
        <div className="relative w-48 h-48">
            <Box className="w-full h-full text-yellow-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px yellow)'}}/>
            <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-ping" />
        </div>
    )
}

export default function RewardPage({ searchParams }: RewardPageProps) {
  const { archetype } = searchParams;

  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary">LEVEL UP!</h1>
        <p className="text-lg text-muted-foreground mt-2">You are now Level 1. Your journey has truly begun.</p>
      </div>
      
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
        <Card className="w-full max-w-md bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">First Quest Complete</CardTitle>
            <CardDescription>You earned a loot box for your efforts.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <LootBox />
            <div className="grid grid-cols-2 gap-4 text-center w-full">
                <div className="bg-black/20 p-3 rounded-lg">
                    <p className="font-bold text-lg text-primary">Cosmetic Skin</p>
                    <p className="text-sm text-muted-foreground">({archetype} Themed)</p>
                </div>
                 <div className="bg-black/20 p-3 rounded-lg">
                    <p className="font-bold text-lg text-accent flex items-center justify-center gap-2"><Gem className="w-4 h-4" /> Streak Freeze</p>
                    <p className="text-sm text-muted-foreground">(x1)</p>
                </div>
            </div>
          </CardContent>
        </Card>
        
        <Button asChild size="lg" className="w-full max-w-md font-bold group">
          <Link href="/?first_quest_complete=true">
            Enter the ATLAS
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
