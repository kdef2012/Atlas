
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, Shield, Users, Crown } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { Fireteam, User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export function FireteamStatus() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    
    // In a real app, the user's fireteamId would be used.
    // For now, we'll hardcode one for demonstration.
    const fireteamId = "quantum-leapers";
    const fireteamRef = useMemoFirebase(() => fireteamId ? doc(firestore, 'fireteams', fireteamId) : null, [firestore, fireteamId]);
    const { data: fireteam, isLoading } = useDoc<Fireteam>(fireteamRef);
    
    const user1Avatar = PlaceHolderImages.find(p => p.id === 'fireteam-user1');
    const user2Avatar = PlaceHolderImages.find(p => p.id === 'fireteam-user2');
    const user3Avatar = PlaceHolderImages.find(p => p.id === 'fireteam-user3');
    const youAvatar = PlaceHolderImages.find(p => p.id === 'avatar');

    // This is placeholder data until we have real user profiles for fireteam members
    const memberPlaceholders = [
        { name: "Cypher", avatar: user1Avatar },
        { name: "Glitch", avatar: user2Avatar },
        { name: "Rogue", avatar: user3Avatar },
        { name: "You", avatar: youAvatar },
    ];

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
                <CardDescription>Your current squad and status.</CardDescription>
            </CardHeader>
            <CardContent>
                {fireteam ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">{fireteam.name}</h3>
                        {fireteam.streakActive ? (
                             <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 border-accent-foreground/20">
                                <Link className="h-3 w-3 mr-1"/>
                                Soul Link Active
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <Shield className="h-3 w-3 mr-1"/>
                                Link Broken
                            </Badge>
                        )}
                    </div>
                    <div className="flex -space-x-2 overflow-hidden mb-4">
                        {memberPlaceholders.map(member => (
                            <Avatar key={member.name} className="border-2 border-background">
                                <AvatarImage src={member.avatar?.imageUrl} data-ai-hint={member.avatar?.imageHint} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                         <Avatar className="border-2 border-dashed border-muted-foreground">
                            <AvatarFallback>+</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        <p>XP Multiplier: <span className="font-bold text-accent">1.2x</span></p>
                        <p className="text-xs mt-1">Keep the daily streak alive to maintain the bonus!</p>
                    </div>
                </>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p>You are not in a Fireteam.</p>
                        <button className="text-primary font-bold text-sm mt-2">Join or Create a Team</button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
