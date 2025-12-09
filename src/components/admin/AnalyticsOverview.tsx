
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

    const skillsQuery = useMemoFirebase(() => adminData ? collection(firestore, 'skills') : null, [adminData, firestore]);
    const fireteamsQuery = useMemoFirebase(() => adminData ? collection(firestore, 'fireteams') : null, [adminData, firestore]);
    const guildsQuery = useMemoFirebase(() => adminData ? collection(firestore, 'guilds') : null, [adminData, firestore]);

    const { data: skills, isLoading: skillsLoading } = useCollection<Skill>(skillsQuery);
    const { data: fireteams, isLoading: fireteamsLoading } = useCollection<Fireteam>(fireteamsQuery);
    const { data: guilds, isLoading: guildsLoading } = useCollection<Guild>(guildsQuery);
    
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
