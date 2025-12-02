
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from 'next/dynamic';
import type { Territory } from "@/lib/types";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { TerritoryRow } from "@/components/turf-wars/TerritoryRow";

const Map = dynamic(() => import('@/components/turf-wars/Map').then(mod => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground"><p className="text-muted-foreground">Loading Map...</p></div>
});


function TerritoryList({ territories, isLoading }: { territories: Territory[] | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-6 pt-0">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (!territories || territories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No territories found.</p>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="lg:col-span-2 h-full">
         <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Turf Wars</CardTitle>
                <CardDescription>Claim real-world locations for your Fireteam. Control generates resources.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <Map territories={territories || []} isLoading={isLoading} />
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 h-full">
         <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Territories</CardTitle>
                <CardDescription>Current status of contested zones.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <TerritoryList territories={territories} isLoading={isLoading} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
