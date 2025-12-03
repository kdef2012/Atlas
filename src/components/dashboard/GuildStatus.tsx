
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Building2, PlusCircle, Zap, MessageSquare } from "lucide-react";
import { useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { Guild, User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import { CATEGORY_ICONS } from '@/lib/types';


export function GuildStatus() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

    const guildId = user?.guildId;
    const guildRef = useMemoFirebase(() => guildId ? doc(firestore, 'guilds', guildId) : null, [firestore, guildId]);
    const { data: guild, isLoading: isGuildLoading } = useDoc<Guild>(guildRef);
    
    useEffect(() => {
        if (guildRef && guild) {
            const now = Date.now();
            let shouldUpdate = false;
            let guildUpdate: Partial<Guild> = {};

            // If challenge is over
            if (now > guild.challengeEndsAt) {
                // If goal was met, activate buff for next cycle. If not, deactivate.
                const buffActive = guild.challengeProgress >= guild.challengeGoal;
                if (guild.isBuffActive !== buffActive) {
                    guildUpdate.isBuffActive = buffActive;
                }
                
                // Reset for a new week
                const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
                const memberCount = Object.keys(guild.members).length || 1;
                guildUpdate.challengeGoal = memberCount * 1000; // e.g., 1000 XP per member
                guildUpdate.challengeProgress = 0;
                guildUpdate.challengeEndsAt = sevenDaysFromNow;
                shouldUpdate = true;

                if(buffActive) {
                    toast({
                        title: 'Guild Challenge Won!',
                        description: `Your guild has unlocked the +25% XP buff for this week!`,
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Guild Challenge Lost',
                        description: `Your guild failed to meet the weekly goal. The XP buff is inactive.`,
                    });
                }
            } else if (guild.challengeProgress >= guild.challengeGoal && !guild.isBuffActive) {
                // If goal is met mid-week, activate buff immediately
                guildUpdate.isBuffActive = true;
                shouldUpdate = true;
                toast({
                    title: 'Guild Buff Activated!',
                    description: 'Your guild has met its goal! The +25% XP buff is now active.',
                });
            }

            if (shouldUpdate) {
                updateDocumentNonBlocking(guildRef, guildUpdate);
            }
        } else if (guildRef && !guild) {
            // This can happen if a user is part of a guild that gets deleted. Clean up user's record.
            if(userRef && user?.guildId) {
                updateDocumentNonBlocking(userRef, { guildId: undefined });
            }
        }
    }, [guild, guildRef, firestore, toast, userRef, user?.guildId]);

    const isLoading = isUserLoading || (guildId && isGuildLoading);

    if (isLoading) {
        return <Skeleton className="h-56 w-full" />
    }

    const progressPercentage = guild ? (guild.challengeProgress / guild.challengeGoal) * 100 : 0;
    const GuildIcon = guild ? CATEGORY_ICONS[guild.category] : Building2;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Building2 />
                    Guild
                </CardTitle>
                <CardDescription>Your guild's collective status.</CardDescription>
            </CardHeader>
            <CardContent>
                {guild ? (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold flex items-center gap-2"><GuildIcon className="w-4 h-4"/>{guild.name}</h3>
                         <Badge className={cn(guild.isBuffActive ? "bg-accent text-accent-foreground" : "bg-destructive/80 text-destructive-foreground")}>
                            <Zap className="h-3 w-3 mr-1"/>
                            {guild.isBuffActive ? "+25% XP Buff" : "No Buff"}
                        </Badge>
                    </div>

                    <div className="space-y-2 mt-4">
                        <p className="text-xs text-muted-foreground">Weekly Guild Goal</p>
                        <Progress value={progressPercentage} />
                        <p className="text-xs text-right font-mono">{guild.challengeProgress.toLocaleString()} / {guild.challengeGoal.toLocaleString()} XP</p>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                        {guild.isBuffActive ? "The buff is active! All XP gains are increased." : "Contribute XP from your activities to unlock the guild-wide buff!"}
                    </p>
                </>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="mb-4">You have not pledged to a Guild.</p>
                        <Button asChild size="sm">
                            <Link href="/guilds">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Find a Guild
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
             {guild && (
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/guilds/${guild.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Open Guild Hall
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

    