
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Territory } from "@/lib/types";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { TerritoryRow } from "@/components/turf-wars/TerritoryRow";
import { CATEGORY_ICONS } from "@/lib/types";


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

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-6 pt-0">
      {territories.map(t => (
        <TerritoryRow key={t.id} territory={t} />
      ))}
      </div>
    </ScrollArea>
  );
}


export default function TurfWarsPage() {
  const firestore = useFirestore();
  const territoriesCollection = useMemoFirebase(() => collection(firestore, 'territories'), [firestore]);
  const { data: territories, isLoading } = useCollection<Territory>(territoriesCollection);

  const ChallengeIcon = CATEGORY_ICONS['Challenge'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
          <ChallengeIcon className="w-8 h-8 text-primary"/>
          Faction Challenges
        </CardTitle>
        <CardDescription>Compete with your Fireteam in weekly challenges based on skill Factions. The top-scoring teams earn rewards and glory.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
          <TerritoryList territories={territories} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
