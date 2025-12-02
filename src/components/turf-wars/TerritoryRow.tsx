
'use client';

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Shield } from "lucide-react";
import type { Territory, Fireteam } from "@/lib/types";
import { useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";

interface TerritoryRowProps {
    territory: Territory;
}

export function TerritoryRow({ territory }: TerritoryRowProps) {
    const firestore = useFirestore();
    const fireteamRef = useMemoFirebase(() => 
        territory.controlledBy ? doc(firestore, 'fireteams', territory.controlledBy) : null, 
    [firestore, territory.controlledBy]);
    
    const { data: fireteam, isLoading } = useDoc<Fireteam>(fireteamRef);

    const teamAvatar = PlaceHolderImages.find(p => p.id === territory.avatarId);

    if (isLoading) {
        return <Skeleton className="h-16 w-full" />;
    }

    return (
        <Card className="p-3 bg-card/50">
            <div className="flex items-center gap-4">
                {fireteam ? (
                    <Avatar>
                        <AvatarImage src={teamAvatar?.imageUrl} data-ai-hint={teamAvatar?.imageHint} />
                        <AvatarFallback>{fireteam.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                ) : (
                    <div className="p-2.5 rounded-full bg-muted">
                        <Shield className="w-5 h-5 text-muted-foreground"/>
                    </div>
                )}
                <div className="flex-1">
                    <p className="font-bold">{territory.name}</p>
                    {fireteam ? (
                          <p className="text-xs text-primary">{fireteam.name}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Unclaimed</p>
                    )}
                    
                </div>
                {territory.controlDuration && <p className="text-xs text-muted-foreground">{territory.controlDuration}</p>}
            </div>
        </Card>
    );
}
