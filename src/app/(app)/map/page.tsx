
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { Guild } from '@/lib/types';

// Dynamically import the map component to prevent SSR issues with Leaflet
const WorldMap = dynamic(() => import('@/components/map/WorldMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[60vh] w-full" />,
});

export default function MapPage() {
  const firestore = useFirestore();
  const guildsCollection = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
  const { data: guilds, isLoading } = useCollection<Guild>(guildsCollection);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary"/>
            World Map
        </CardTitle>
        <CardDescription>
          Visualize the global presence of ATLAS guilds and communities.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 -m-6">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <WorldMap guilds={guilds} isLoading={isLoading} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
