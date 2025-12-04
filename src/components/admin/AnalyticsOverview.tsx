
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { User, Skill, Fireteam, Guild, Suggestion } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Users, Atom, Users2, Building2, MessageSquare } from "lucide-react";

function StatCard({ title, value, icon: Icon, isLoading }: { title: string, value: number, icon: React.ElementType, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

export function AnalyticsOverview() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    
    // Get user document to check admin status
    const userRef = useMemoFirebase(
        () => authUser ? doc(firestore, 'users', authUser.uid) : null,
        [firestore, authUser]
    );
    const { data: userData, isLoading: userLoading } = useDoc<User>(userRef);

    // ✅ Only create queries if user is admin
    const usersCollection = useMemoFirebase(
        () => userData?.isAdmin ? collection(firestore, 'users') : null,
        [firestore, userData?.isAdmin]
    );
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

    const skillsCollection = useMemoFirebase(
        () => userData?.isAdmin ? collection(firestore, 'skills') : null,
        [firestore, userData?.isAdmin]
    );
    const { data: skills, isLoading: skillsLoading } = useCollection<Skill>(skillsCollection);
    
    const fireteamsCollection = useMemoFirebase(
        () => userData?.isAdmin ? collection(firestore, 'fireteams') : null,
        [firestore, userData?.isAdmin]
    );
    const { data: fireteams, isLoading: fireteamsLoading } = useCollection<Fireteam>(fireteamsCollection);
    
    const guildsCollection = useMemoFirebase(
        () => userData?.isAdmin ? collection(firestore, 'guilds') : null,
        [firestore, userData?.isAdmin]
    );
    const { data: guilds, isLoading: guildsLoading } = useCollection<Guild>(guildsCollection);
    
    const suggestionsCollection = useMemoFirebase(
        () => userData?.isAdmin ? collection(firestore, 'suggestions') : null,
        [firestore, userData?.isAdmin]
    );
    const { data: suggestions, isLoading: suggestionsLoading } = useCollection<Suggestion>(suggestionsCollection);

    const isLoading = userLoading || usersLoading || skillsLoading || fireteamsLoading || guildsLoading || suggestionsLoading;

    // Wait for user document to load
    if (userLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // ✅ Don't render if not admin
    if (!userData?.isAdmin) {
        return null;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Total Users" value={users?.length || 0} icon={Users} isLoading={isLoading} />
            <StatCard title="Pioneered Skills" value={skills?.length || 0} icon={Atom} isLoading={isLoading} />
            <StatCard title="Active Fireteams" value={fireteams?.length || 0} icon={Users2} isLoading={isLoading} />
            <StatCard title="Established Guilds" value={guilds?.length || 0} icon={Building2} isLoading={isLoading} />
            <StatCard title="Suggestions" value={suggestions?.length || 0} icon={MessageSquare} isLoading={isLoading} />
        </div>
    )
}
