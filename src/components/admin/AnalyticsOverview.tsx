
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { User, Skill, Fireteam, Guild } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Users, Atom, Users2, Building2 } from "lucide-react";

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
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    
    const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
    const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

    const shouldQuery = !!adminData;

    const usersCollection = useMemoFirebase(
        () => shouldQuery ? collection(firestore, 'users') : null,
        [firestore, shouldQuery]
    );
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

    const skillsCollection = useMemoFirebase(
        () => shouldQuery ? collection(firestore, 'skills') : null,
        [firestore, shouldQuery]
    );
    const { data: skills, isLoading: skillsLoading } = useCollection<Skill>(skillsCollection);
    
    const fireteamsCollection = useMemoFirebase(
        () => shouldQuery ? collection(firestore, 'fireteams') : null,
        [firestore, shouldQuery]
    );
    const { data: fireteams, isLoading: fireteamsLoading } = useCollection<Fireteam>(fireteamsCollection);
    
    const guildsCollection = useMemoFirebase(
        () => shouldQuery ? collection(firestore, 'guilds') : null,
        [firestore, shouldQuery]
    );
    const { data: guilds, isLoading: guildsLoading } = useCollection<Guild>(guildsCollection);
    
    const isLoading = isAuthLoading || isAdminDocLoading || (shouldQuery && (usersLoading || skillsLoading || fireteamsLoading || guildsLoading));

    if (!shouldQuery && !isLoading) {
        return null; // Don't render if not an admin and not loading
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={users?.length || 0} icon={Users} isLoading={isLoading} />
            <StatCard title="Pioneered Skills" value={skills?.length || 0} icon={Atom} isLoading={isLoading} />
            <StatCard title="Active Fireteams" value={fireteams?.length || 0} icon={Users2} isLoading={isLoading} />
            <StatCard title="Established Guilds" value={guilds?.length || 0} icon={Building2} isLoading={isLoading} />
        </div>
    )
}
