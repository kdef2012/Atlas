
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Territory, Fireteam, User } from "@/lib/types";
import { useCollection, useMemoFirebase, addDocumentNonBlocking, useDoc } from "@/firebase";
import { useFirestore, useUser } from "@/firebase/provider";
import { collection, doc, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { TerritoryRow } from "@/components/turf-wars/TerritoryRow";
import { CATEGORY_ICONS } from "@/lib/types";
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trophy } from 'lucide-react';
import { generateFactionChallenges } from '@/ai/flows/generate-faction-challenges';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function Leaderboard({ territory }: { territory: Territory }) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const fireteamIds = territory.scores ? Object.keys(territory.scores) : [];
  
  const fireteamsQuery = useMemoFirebase(() => {
    if (!user?.region || fireteamIds.length === 0) return null;
    return query(
        collection(firestore, 'fireteams'),
        where('region', '==', user.region),
        where('__name__', 'in', fireteamIds)
    );
  }, [firestore, user?.region, fireteamIds]);

  const { data: fireteams, isLoading } = useCollection<Fireteam>(fireteamsQuery);
  const teamAvatar = PlaceHolderImages.find(p => p.id === 'avatar');

  if (isLoading) {
    return <div className="space-y-2 p-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-full"/>)}
    </div>
  }

  if (!fireteams || fireteams.length === 0) {
    return <p className="text-center text-sm text-muted-foreground p-4">No fireteams from your region have participated in this challenge yet.</p>
  }
  
  const sortedTeams = fireteams.sort((a, b) => (territory.scores[b.id] || 0) - (territory.scores[a.id] || 0));

  return (
    <div className="space-y-2 p-4 bg-black/10 rounded-b-md">
      <h4 className="font-bold text-center text-sm mb-2">{user?.region} Leaderboard</h4>
      {sortedTeams.map((team, index) => (
        <div key={team.id} className="flex items-center gap-4 p-2 rounded-md bg-card/50">
            <span className="font-bold w-4 text-lg">
                {index === 0 ? <Trophy className="w-5 h-5 text-yellow-400"/> : index + 1}
            </span>
            <Avatar className="h-8 w-8">
                <AvatarImage src={teamAvatar?.imageUrl} data-ai-hint={teamAvatar?.imageHint} />
                <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 font-semibold text-sm">{team.name}</span>
            <span className="font-mono text-sm">{territory.scores[team.id] || 0} pts</span>
        </div>
      ))}
    </div>
  )
}


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
      <div className="flex items-center justify-center h-48 text-muted-foreground p-6 text-center border-2 border-dashed rounded-lg">
        <p>No active challenges at the moment. A new cycle will begin soon.</p>
      </div>
    )
  }

  const now = Date.now();
  const activeTerritories = territories.filter(t => t.endsAt > now);
  const pastTerritories = territories.filter(t => t.endsAt <= now).sort((a, b) => b.endsAt - a.endsAt);

  return (
    <div className="space-y-4 p-6 pt-0">
      {activeTerritories.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
            {activeTerritories.map(t => (
                <AccordionItem key={t.id} value={t.id}>
                    <AccordionTrigger>
                        <TerritoryRow territory={t} />
                    </AccordionTrigger>
                    <AccordionContent>
                        <Leaderboard territory={t}/>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      )}

       {pastTerritories.length > 0 && (
          <div className="pt-4">
            <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past Challenges</h3>
            <div className="space-y-2 opacity-70">
              {pastTerritories.map(t => (
                <TerritoryRow key={t.id} territory={t} isPast />
              ))}
            </div>
          </div>
       )}
      </div>
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
          <CardDescription>Compete with your Fireteam in weekly challenges. The top-scoring teams in your region earn rewards and glory.</CardDescription>
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
