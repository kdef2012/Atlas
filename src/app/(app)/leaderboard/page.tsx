
'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, getDocs, where, doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ChevronRight, Globe, MapPin, Building } from "lucide-react";
import { TwinskieAvatarCompact } from "@/components/TwinskiAvatarCompact";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Scope = 'global' | 'state' | 'region';

function LeaderboardTable({ users, isLoading }: { users: User[] | null, isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
        );
    }

    if (!users || users.length === 0) {
        return <p className="text-center text-muted-foreground py-8 font-mono uppercase tracking-widest">Signal Missing: No citizens found in this sector.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead className="text-center">Level</TableHead>
                    <TableHead className="text-right">Total XP</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user, index) => {
                    const rank = index + 1;
                    let rankDisplay: React.ReactNode = rank;
                    if (rank === 1) rankDisplay = <Trophy className="w-5 h-5 text-yellow-400" />;
                    if (rank === 2) rankDisplay = <Trophy className="w-5 h-5 text-gray-400" />;
                    if (rank === 3) rankDisplay = <Trophy className="w-5 h-5 text-orange-400" />;
                    
                    return (
                        <TableRow key={user.id} className="group hover:bg-secondary/20 transition-colors">
                            <TableCell className="font-bold text-lg text-center">{rankDisplay}</TableCell>
                            <TableCell>
                                <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:underline">
                                    <TwinskieAvatarCompact user={user} size={40} showLevel={false} />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-primary">{user.userName}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                                            {user.region}, {user.state}
                                        </span>
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold">{user.level}</TableCell>
                            <TableCell className="text-right font-mono text-accent">{user.xp.toLocaleString()}</TableCell>
                            <TableCell>
                                <Link href={`/users/${user.id}`}>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );
}

export default function LeaderboardPage() {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading } = useUser();
    const [topByLevel, setTopByLevel] = useState<User[] | null>(null);
    const [topByXp, setTopByXp] = useState<User[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scope, setScope] = useState<Scope>('region');

    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: currentUser } = useDoc<User>(userRef);

    useEffect(() => {
        if (isUserLoading || !authUser || (scope !== 'global' && !currentUser)) {
            return;
        }

        const fetchLeaderboards = async () => {
            setIsLoading(true);
            try {
                let baseQuery = collection(firestore, 'users');
                let constraints: any[] = [];

                if (scope === 'state' && currentUser?.state) {
                    constraints.push(where('state', '==', currentUser.state));
                } else if (scope === 'region' && currentUser?.region) {
                    constraints.push(where('region', '==', currentUser.region));
                }

                // Query for top by level
                const levelQuery = query(
                    baseQuery, 
                    ...constraints,
                    orderBy('level', 'desc'), 
                    orderBy('xp', 'desc'), 
                    limit(50)
                );
                const levelSnapshot = await getDocs(levelQuery);
                const levelData = levelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setTopByLevel(levelData);

                // Query for top by XP
                const xpQuery = query(
                    baseQuery, 
                    ...constraints,
                    orderBy('xp', 'desc'), 
                    limit(50)
                );
                const xpSnapshot = await getDocs(xpQuery);
                const xpData = xpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setTopByXp(xpData);

            } catch (error) {
                console.error("Failed to fetch leaderboards:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboards();
    }, [firestore, authUser, isUserLoading, scope, currentUser]);

    return (
        <Tabs defaultValue="level" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-md">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                        <div className="space-y-1">
                            <CardTitle className="font-headline text-4xl flex items-center gap-3">
                                <Trophy className="w-10 h-10 text-primary" />
                                Global Apex
                            </CardTitle>
                            <CardDescription>Competing across the vastness of the ATLAS.</CardDescription>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border">
                                <Select value={scope} onValueChange={(val) => setScope(val as Scope)}>
                                    <SelectTrigger className="w-[180px] border-none bg-transparent">
                                        <div className="flex items-center gap-2">
                                            {scope === 'global' && <Globe className="w-4 h-4" />}
                                            {scope === 'state' && <Building className="w-4 h-4" />}
                                            {scope === 'region' && <MapPin className="w-4 h-4" />}
                                            <SelectValue placeholder="Scope" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="region">Regional ({currentUser?.region || 'City'})</SelectItem>
                                        <SelectItem value="state">State ({currentUser?.state || 'State'})</SelectItem>
                                        <SelectItem value="global">Global Nebula</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <TabsList className="bg-secondary/50 border">
                                <TabsTrigger value="level">By Level</TabsTrigger>
                                <TabsTrigger value="xp">By XP</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 border-t bg-secondary/10">
                    <TabsContent value="level" className="mt-0">
                       <LeaderboardTable users={topByLevel} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="xp" className="mt-0">
                        <LeaderboardTable users={topByXp} isLoading={isLoading} />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
}
