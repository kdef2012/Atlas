
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Shield } from "lucide-react";
import dynamic from 'next/dynamic';
import type { Territory } from "@/lib/types";

// Mock data - this will be replaced with Firestore data
const territories: Territory[] = [
  { id: 't1', name: 'Quantum Park', controlledBy: 'Quantum Leapers', controlDuration: '48h', avatarId: 'fireteam-user1', lat: 37.7749, lng: -122.4194 },
  { id: 't2', name: 'Central Station', controlledBy: 'Void Walkers', controlDuration: '12h', avatarId: 'fireteam-user2', lat: 37.7849, lng: -122.4094 },
  { id: 't3', name: 'The Old Library', controlledBy: 'Chrono Guards', controlDuration: '7d', avatarId: 'fireteam-user3', lat: 37.7649, lng: -122.4294 },
  { id: 't4', name: 'City Hall', controlledBy: null, controlDuration: null, avatarId: null, lat: 37.779, lng: -122.4194 },
];

const Map = dynamic(() => import('@/components/turf-wars/Map').then(mod => mod.Map), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground"><p className="text-muted-foreground">Loading Map...</p></div>
});


export default function TurfWarsPage() {
  const avatar = PlaceHolderImages.find(p => p.id === 'avatar');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="lg:col-span-2 h-full">
         <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Turf Wars</CardTitle>
                <CardDescription>Claim real-world locations for your Fireteam. Control generates resources.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <Map territories={territories} />
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
                <ScrollArea className="h-full">
                    <div className="space-y-2 p-6 pt-0">
                    {territories.map(t => {
                        const teamAvatar = PlaceHolderImages.find(p => p.id === t.avatarId);
                        return (
                            <Card key={t.id} className="p-3 bg-card/50">
                                <div className="flex items-center gap-4">
                                    {t.controlledBy ? (
                                        <Avatar>
                                            <AvatarImage src={teamAvatar?.imageUrl} data-ai-hint={teamAvatar?.imageHint} />
                                            <AvatarFallback>{t.controlledBy.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="p-2.5 rounded-full bg-muted">
                                            <Shield className="w-5 h-5 text-muted-foreground"/>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold">{t.name}</p>
                                        {t.controlledBy ? (
                                             <p className="text-xs text-primary">{t.controlledBy}</p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Unclaimed</p>
                                        )}
                                       
                                    </div>
                                    {t.controlDuration && <p className="text-xs text-muted-foreground">{t.controlDuration}</p>}
                                </div>
                            </Card>
                        )
                    })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
