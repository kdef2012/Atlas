
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { User, Skill, Fireteam, Guild } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Users, Atom, Users2, Building2 } from "lucide-react";
import { UserCounter } from "../common/UserCounter";

function StatCard({ title, value, icon: Icon, isLoading, children }: { title: string, value?: number, icon: React.ElementType, isLoading: boolean, children?: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2" />
                ) : children ? (
                    children
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

    // This useMemo is the key fix. It ensures that the queries are only created
    // when we know the user is an admin, but the hooks themselves are still called
    // on every render. The hooks will simply receive 'null' if the user isn't an admin,
    // which they are designed to handle gracefully.
    const queries = useMemoFirebase(() => {
        if (adminData) {
            return {
                skills: collection(firestore, 'skills'),
                fireteams: collection(firestore, 'fireteams'),
                guilds: collection(firestore, 'guilds')
            }
        }
        return { skills: null, fireteams: null, guilds: null };
    }, [adminData, firestore]);

    const { data: skills, isLoading: skillsLoading } = useCollection<Skill>(queries.skills);
    const { data: fireteams, isLoading: fireteamsLoading } = useCollection<Fireteam>(queries.fireteams);
    const { data: guilds, isLoading: guildsLoading } = useCollection<Guild>(queries.guilds);
    
    const isLoading = isAuthLoading || isAdminDocLoading || skillsLoading || fireteamsLoading || guildsLoading;

    if (!adminData && !isLoading) {
        return null; // Don't render if not an admin and not loading
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" icon={Users} isLoading={isLoading}>
                <UserCounter />
            </StatCard>
            <StatCard title="Pioneered Skills" value={skills?.length || 0} icon={Atom} isLoading={isLoading} />
            <StatCard title="Active Fireteams" value={fireteams?.length || 0} icon={Users2} isLoading={isLoading} />
            <StatCard title="Established Guilds" value={guilds?.length || 0} icon={Building2} isLoading={isLoading} />
        </div>
    )
}
