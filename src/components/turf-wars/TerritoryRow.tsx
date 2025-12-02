
'use client';

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Shield, Trophy } from "lucide-react";
import type { Territory, Fireteam, SkillCategory } from "@/lib/types";
import { useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, doc, query, where, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/types";

interface TerritoryRowProps {
    territory: Territory;
}

function getLeadingFireteam(scores: Record<string, number>): [string, number] | null {
    const entries = Object.entries(scores);
    if (entries.length === 0) return null;

    return entries.reduce((a, b) => a[1] > b[1] ? a : b);
}

export function TerritoryRow({ territory }: TerritoryRowProps) {
    const firestore = useFirestore();
    const leadingTeamEntry = getLeadingFireteam(territory.scores || {});
    const leadingTeamId = leadingTeamEntry ? leadingTeamEntry[0] : null;

    const fireteamRef = useMemoFirebase(() => 
        leadingTeamId ? doc(firestore, 'fireteams', leadingTeamId) : null, 
    [firestore, leadingTeamId]);
    
    const { data: fireteam, isLoading } = useDoc<Fireteam>(fireteamRef);

    const FactionIcon = CATEGORY_ICONS[territory.faction];
    const factionColor = CATEGORY_COLORS[territory.faction];

    const teamAvatar = PlaceHolderImages.find(p => p.id === 'avatar');

    const endsDate = new Date(territory.endsAt).toLocaleDateString();

    if (isLoading && leadingTeamId) {
        return <Skeleton className="h-24 w-full" />;
    }

    return (
        <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${factionColor.replace(')', ' / 0.1)')}`, color: factionColor }}>
                    <FactionIcon className="w-8 h-8"/>
                </div>

                <div className="flex-1">
                    <p className="font-bold text-lg text-primary">{territory.faction} Faction Challenge</p>
                    <p className="text-sm text-muted-foreground">{territory.challengeDescription}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">Ends on: {endsDate}</p>
                </div>
                
                <div className="flex flex-col items-center justify-center w-28">
                    {fireteam ? (
                        <>
                            <Avatar>
                                <AvatarImage src={teamAvatar?.imageUrl} data-ai-hint={teamAvatar?.imageHint} />
                                <AvatarFallback>{fireteam.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-bold text-center mt-1">{fireteam.name}</p>
                            <p className="text-xs text-amber-400 flex items-center gap-1"><Trophy className="w-3 h-3"/> {leadingTeamEntry?.[1]} pts</p>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Shield className="w-6 h-6 mx-auto mb-1"/>
                            <p className="text-xs italic">No clear leader</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
