
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, ShieldOff } from "lucide-react";
import { useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function MomentumFlame() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);
    
    useEffect(() => {
        if (userRef && user) {
            const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
            const isFlameActive = user.lastLogTimestamp > twentyFourHoursAgo;
            
            // If the current flame status in Firestore is different from what we've calculated, update it.
            // This handles the case where a user becomes inactive. Logging an activity already sets it to true.
            if (user.momentumFlameActive !== isFlameActive) {
                updateDocumentNonBlocking(userRef, { momentumFlameActive: isFlameActive });
            }
        }
    }, [user, userRef]);

    const isLoading = isUserLoading;
    const isFlameActive = user?.momentumFlameActive ?? false;
    const xpBonus = isFlameActive ? "1.5x" : "1.0x";

    if (isLoading) {
        return <Skeleton className="h-32 w-full" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Flame />
                    Momentum Flame
                </CardTitle>
                <CardDescription>Your personal activity streak.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Daily XP Bonus</h3>
                    <Badge className={cn(isFlameActive ? 'bg-accent text-accent-foreground' : 'bg-destructive/80 text-destructive-foreground')}>
                        {isFlameActive ? <Flame className="h-3 w-3 mr-1"/> : <ShieldOff className="h-3 w-3 mr-1"/> }
                        {xpBonus} XP
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    {isFlameActive ? "Your flame is burning brightly! Keep logging daily." : "Your flame has gone out. Log an activity to reignite it!"}
                </p>
            </CardContent>
        </Card>
    )
}

    