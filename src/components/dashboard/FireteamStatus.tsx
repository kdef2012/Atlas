

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Shield, Users, Crown, PlusCircle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc, collection, query, where, writeBatch } from "firebase/firestore";
import type { Fireteam, User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const SOUL_SWORN_THRESHOLD_DAYS = 7;

function MemberAvatar({ member, isOwner }: { member: User, isOwner: boolean }) {
    const avatarData = PlaceHolderImages.find(p => p.id === 'avatar');
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const isActive = member.lastLogTimestamp > twentyFourHoursAgo;
    const tooltipText = `${member.userName} - ${isActive ? 'Active' : 'Inactive'}`;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative">
                    <Avatar className="border-2 border-background">
                        <AvatarImage src={avatarData?.imageUrl} data-ai-hint={avatarData?.imageHint} />
                        <AvatarFallback>{member.userName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background", isActive ? "bg-green-500" : "bg-gray-500")}></div>
                    {isOwner && (
                        <Crown className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 rotate-12" style={{ filter: 'drop-shadow(0 0 2px black)'}}/>
                    )}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltipText}</p>
            </TooltipContent>
        </Tooltip>
    );
}


function FireteamMembers({ fireteam }: { fireteam: Fireteam }) {
    const firestore = useFirestore();
    const memberIds = Object.keys(fireteam.members);

    const membersQuery = useMemoFirebase(() => {
        if (memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', memberIds));
    }, [firestore, memberIds]);

    const { data: members, isLoading } = useCollection<User>(membersQuery);

    if (isLoading) {
        return <div className="flex -space-x-2 overflow-hidden mb-4">
            {[...Array(memberIds.length)].map((_, i) => <Skeleton key={i} className="w-10 h-10 rounded-full" />)}
        </div>;
    }

    return (
        <TooltipProvider>
            <div className="flex -space-x-2 overflow-hidden mb-4">
                {members?.map(member => (
                    <MemberAvatar key={member.id} member={member} isOwner={member.id === fireteam.ownerId} />
                ))}
                 <Avatar className="border-2 border-dashed border-muted-foreground">
                    <AvatarFallback>+</AvatarFallback>
                </Avatar>
            </div>
        </TooltipProvider>
    );
}


export function FireteamStatus() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

    const fireteamId = user?.fireteamId;
    const fireteamRef = useMemoFirebase(() => fireteamId ? doc(firestore, 'fireteams', fireteamId) : null, [firestore, fireteamId]);
    const { data: fireteam, isLoading: isFireteamLoading } = useDoc<Fireteam>(fireteamRef);
    
    const memberIds = useMemoFirebase(() => fireteam ? Object.keys(fireteam.members) : [], [fireteam]);
    const membersQuery = useMemoFirebase(() => {
        if (memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', memberIds));
    }, [firestore, memberIds]);
    const { data: members, isLoading: areMembersLoading } = useCollection<User>(membersQuery);
    
    const prevStreakStatusRef = useRef<boolean | undefined>(fireteam?.streakActive);

    useEffect(() => {
        if (fireteamRef && members && members.length > 0 && fireteam) {
            const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
            const allActive = members.every(member => member.lastLogTimestamp > twentyFourHoursAgo);
            
            let fireteamUpdate: any = {};
            let shouldUpdate = false;

            if (fireteam.streakActive && !allActive) { // Streak just broke
                fireteamUpdate.streakActive = false;
                fireteamUpdate.streakStartDate = null;
                shouldUpdate = true;
            } else if (!fireteam.streakActive && allActive) { // Streak just started
                fireteamUpdate.streakActive = true;
                fireteamUpdate.streakStartDate = Date.now();
                shouldUpdate = true;
            }

            if (shouldUpdate) {
                updateDocumentNonBlocking(fireteamRef, fireteamUpdate);
            }

            // Check for Soul-Sworn trait
            if (fireteam.streakActive && fireteam.streakStartDate) {
                const streakDuration = Date.now() - fireteam.streakStartDate;
                if (streakDuration >= SOUL_SWORN_THRESHOLD_DAYS * 24 * 60 * 60 * 1000) {
                    const batch = writeBatch(firestore);
                    let traitAwarded = false;
                    members.forEach(member => {
                        if (!member.traits?.soul_sworn) {
                            const memberRef = doc(firestore, 'users', member.id);
                            batch.update(memberRef, { 'traits.soul_sworn': true });
                            traitAwarded = true;
                        }
                    });
                    if (traitAwarded) {
                        batch.commit().then(() => {
                            toast({ title: "Trait Unlocked: Soul-Sworn!", description: `Your Fireteam's bond is unbreakable. All members have earned this trait.` });
                        });
                    }
                }
            }
        }
    }, [members, fireteamRef, fireteam, firestore, toast]);

    useEffect(() => {
        const prevStreakStatus = prevStreakStatusRef.current;
        const currentStreakStatus = fireteam?.streakActive;

        if (prevStreakStatus === true && currentStreakStatus === false) {
            toast({
                variant: 'destructive',
                title: 'Soul Link Broken!',
                description: `The activity streak for Fireteam "${fireteam.name}" has been broken.`,
            });
        }
        prevStreakStatusRef.current = currentStreakStatus;
    }, [fireteam?.streakActive, fireteam?.name, toast]);

    const isLoading = isUserLoading || (fireteamId && (isFireteamLoading || areMembersLoading));
    const isStreakActive = fireteam?.streakActive ?? false;

    if (isLoading) {
        return <Skeleton className="h-56 w-full" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users />
                    Fireteam
                </CardTitle>
                <CardDescription>Your current squad status.</CardDescription>
            </CardHeader>
            <CardContent>
                {fireteam ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">{fireteam.name}</h3>
                        {isStreakActive === true && (
                             <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 border-accent-foreground/20">
                                <LinkIcon className="h-3 w-3 mr-1"/>
                                Soul Link Active
                            </Badge>
                        )}
                        {isStreakActive === false && (
                            <Badge variant="destructive">
                                <Shield className="h-3 w-3 mr-1"/>
                                Link Broken
                            </Badge>
                        )}
                    </div>
                    
                    <FireteamMembers fireteam={fireteam} />

                    <div className="text-sm text-muted-foreground">
                        <p>XP Multiplier: <span className={cn("font-bold", isStreakActive ? "text-accent" : "text-destructive")}>
                            {isStreakActive ? "1.2x" : "1.0x"}
                        </span></p>
                        <p className="text-xs mt-1">
                            {isStreakActive ? "The Soul Link is strong! Keep the streak alive." : "A member has been inactive. Log an activity to rebuild the link!"}
                        </p>
                    </div>
                </>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p className="mb-4">You are not in a Fireteam.</p>
                        <Button asChild size="sm">
                            <Link href="/fireteams">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Find a Team
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    