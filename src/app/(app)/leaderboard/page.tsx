
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { TwinskieAvatarCompact } from "@/components/TwinskiAvatarCompact";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        return <p className="text-center text-muted-foreground py-8">No users found.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-center">Level</TableHead>
                    <TableHead className="text-right">Total XP</TableHead>
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
                        <TableRow key={user.id}>
                            <TableCell className="font-bold text-lg text-center">{rankDisplay}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <TwinskieAvatarCompact user={user} size={40} />
                                    <span className="font-medium">{user.userName}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold">{user.level}</TableCell>
                            <TableCell className="text-right font-mono">{user.xp.toLocaleString()}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    );
}

export default function LeaderboardPage() {
    const firestore = useFirestore();

    const topByLevelQuery = useMemoFirebase(() =>
        query(collection(firestore, 'users'), orderBy('level', 'desc'), orderBy('xp', 'desc'), limit(100)),
        [firestore]
    );
    const { data: topByLevel, isLoading: isLoadingLevel } = useCollection<User>(topByLevelQuery);
    
    const topByXpQuery = useMemoFirebase(() =>
        query(collection(firestore, 'users'), orderBy('xp', 'desc'), limit(100)),
        [firestore]
    );
    const { data: topByXp, isLoading: isLoadingXp } = useCollection<User>(topByXpQuery);

    return (
        <Tabs defaultValue="level">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <Trophy className="w-8 h-8 text-primary" />
                                Global Leaderboards
                            </CardTitle>
                            <CardDescription>See who stands at the pinnacle of ATLAS.</CardDescription>
                        </div>
                        <TabsList>
                            <TabsTrigger value="level">By Level</TabsTrigger>
                            <TabsTrigger value="xp">By XP</TabsTrigger>
                        </TabsList>
                    </div>
                </CardHeader>
                <CardContent>
                    <TabsContent value="level">
                       <LeaderboardTable users={topByLevel} isLoading={isLoadingLevel} />
                    </TabsContent>
                    <TabsContent value="xp">
                        <LeaderboardTable users={topByXp} isLoading={isLoadingXp} />
                    </TabsContent>
                </CardContent>
            </Card>
        </Tabs>
    );
}
