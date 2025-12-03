
'use client';

import { Shield, Trophy } from "lucide-react";
import type { Territory, Fireteam, SkillCategory, User } from "@/lib/types";
import { useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TwinskieAvatarCompact } from "../twinskie-avatar-compact";

interface TerritoryRowProps {
    territory: Territory;
    isPast?: boolean;
}

function getLeadingFireteam(scores: Record<string, number>): [string, number] | null {
    const entries = Object.entries(scores);
    if (entries.length === 0) return null;

    return entries.reduce((a, b) => a[1] > b[1] ? a : b, ["", 0]);
}

export function TerritoryRow({ territory, isPast = false }: TerritoryRowProps) {
    const firestore = useFirestore();
    const leadingTeamEntry = getLeadingFireteam(territory.scores || {});
    const leadingTeamId = leadingTeamEntry ? leadingTeamEntry[0] : null;

    const fireteamRef = useMemoFirebase(() => 
        leadingTeamId ? doc(firestore, 'fireteams', leadingTeamId) : null, 
    [firestore, leadingTeamId]);
    const { data: fireteam, isLoading: isFireteamLoading } = useDoc<Fireteam>(fireteamRef);
    
    const ownerRef = useMemoFirebase(() =>
        fireteam ? doc(firestore, 'users', fireteam.ownerId) : null,
    [firestore, fireteam]);
    const { data: owner, isLoading: isOwnerLoading } = useDoc<User>(ownerRef);

    const isLoading = (leadingTeamId && isFireteamLoading) || (fireteam && isOwnerLoading);
    const FactionIcon = CATEGORY_ICONS[territory.faction];
    const factionColor = CATEGORY_COLORS[territory.faction];
    const endsDate = new Date(territory.endsAt).toLocaleDateString();

    if (isLoading) {
        return <Skeleton className="h-20 w-full" />;
    }

    return (
        <div className={cn("p-4 rounded-lg bg-card/80 flex items-center gap-4 w-full text-left", isPast && "bg-card/50")}>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${factionColor.replace(')', ' / 0.1)')}`, color: factionColor }}>
                <FactionIcon className="w-8 h-8"/>
            </div>

            <div className="flex-1">
                <p className="font-bold text-lg text-primary">{territory.faction} Faction Challenge</p>
                <p className="text-sm text-muted-foreground">{territory.challengeDescription}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                    {isPast ? `Ended on: ${endsDate}`: `Ends on: ${endsDate}`}
                </p>
            </div>
            
            <div className="flex flex-col items-center justify-center w-32 text-center">
                {fireteam && owner ? (
                    <>
                        {isPast ? <p className="text-xs font-bold text-yellow-400 flex items-center gap-1"><Trophy className="w-3 h-3"/> WINNER</p> : <p className="text-xs font-bold text-accent">LEADING</p> }
                        <TwinskieAvatarCompact user={owner} size={40} />
                        <p className="text-xs font-bold mt-1 truncate w-full">{fireteam.name}</p>
                        <p className="text-xs text-muted-foreground"> {leadingTeamEntry?.[1]} pts</p>
                    </>
                ) : (
                    <div className="text-muted-foreground">
                        <Shield className="w-6 h-6 mx-auto mb-1"/>
                        <p className="text-xs italic">{!isPast ? 'No clear leader' : 'No scores logged'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
