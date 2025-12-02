
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Territory } from "@/lib/types";
import { useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { TerritoryRow } from "@/components/turf-wars/TerritoryRow";
import { CATEGORY_ICONS } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { generateFactionChallenges } from '@/ai/flows/generate-faction-challenges';
import { useToast } from '@/hooks/use-toast';


function TerritoryList({ territories, isLoading }: { territories: Territory[] | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-6 pt-0">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  if (!territories || territories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-6 text-center">
        <p>No active challenges at the moment. A new cycle will begin soon.</p>
      </div>
    )
  }

  // Filter out challenges that have ended
  const now = Date.now();
  const activeTerritories = territories.filter(t => t.endsAt > now);
  const pastTerritories = territories.filter(t => t.endsAt <= now).sort((a, b) => b.endsAt - a.endsAt);


  if (activeTerritories.length === 0 && pastTerritories.length === 0) {
     return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-6 text-center">
        <p>No active challenges at the moment. A new cycle will begin soon.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-6 pt-0">
      {activeTerritories.length > 0 && (
        <div className="space-y-2">
            {activeTerritories.map(t => (
                <TerritoryRow key={t.id} territory={t} />
            ))}
        </div>
      )}

       {pastTerritories.length > 0 && (
          <div className="pt-4">
            <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past Challenges</h3>
            <div className="space-y-2 opacity-70">
              {pastTerritories.map(t => (
                <TerritoryRow key={t.id} territory={t} />
              ))}
            </div>
          </div>
       )}
      </div>
    </ScrollArea>
  );
}


export default function TurfWarsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const territoriesCollection = useMemoFirebase(() => collection(firestore, 'territories'), [firestore]);
  const { data: territories, isLoading } = useCollection<Territory>(territoriesCollection);

  const handleGenerateChallenges = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFactionChallenges();
      
      // The flow now returns challenges with `endsAt` and `scores` pre-filled
      result.challenges.forEach(challenge => {
        addDocumentNonBlocking(territoriesCollection, challenge);
      });
      
      toast({
        title: "New Challenges Generated!",
        description: "A new week of Faction Challenges has begun."
      });

    } catch (error) {
      console.error("Failed to generate challenges:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate new challenges. The AI might be busy."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const ChallengeIcon = CATEGORY_ICONS['Challenge'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <ChallengeIcon className="w-8 h-8 text-primary"/>
            Faction Challenges
          </CardTitle>
          <CardDescription>Compete with your Fireteam in weekly challenges based on skill Factions. The top-scoring teams earn rewards and glory.</CardDescription>
        </div>
        <Button onClick={handleGenerateChallenges} disabled={isGenerating || !territoriesCollection}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Generate New Cycle
        </Button>
      </CardHeader>
      <CardContent className="p-0">
          <TerritoryList territories={territories} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
