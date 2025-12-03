
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { TwinskieAvatarCompact } from "../twinskie-avatar-compact";

export function UserList() {
    const firestore = useFirestore();
    const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading } = useCollection<User>(usersCollection);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>A list of all users in the ATLAS system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Archetype</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="text-right">Admin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {users?.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <TwinskieAvatarCompact user={user} size={32} showLevel={false} />
                                        <div className="font-medium">{user.userName}</div>
                                    </div>
                                </TableCell>
                                <TableCell>{user.level}</TableCell>
                                <TableCell>{user.archetype}</TableCell>
                                <TableCell>{formatDistanceToNow(user.lastLogTimestamp, { addSuffix: true })}</TableCell>
                                <TableCell className="text-right">
                                    {user.isAdmin && <Badge>Admin</Badge>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
