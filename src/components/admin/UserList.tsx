
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { TwinskieAvatarCompact } from "../twinskie-avatar-compact";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { GiftGemsDialog } from "./GiftGemsDialog";

export function UserList() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();

    const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading } = useCollection<User>(usersCollection);
    
    const handleAdminToggle = (userToUpdate: User) => {
        if (!authUser || authUser.uid === userToUpdate.id) return;
        
        const userRef = doc(firestore, 'users', userToUpdate.id);
        const newAdminStatus = !userToUpdate.isAdmin;

        updateDocumentNonBlocking(userRef, { isAdmin: newAdminStatus });

        toast({
            title: "Permissions Updated",
            description: `${userToUpdate.userName} has been ${newAdminStatus ? 'promoted to' : 'demoted from'} admin.`,
        });
    }

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
                            <TableHead>Last Active</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
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
                                <TableCell>{formatDistanceToNow(user.lastLogTimestamp, { addSuffix: true })}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={!!user.isAdmin}
                                        onCheckedChange={() => handleAdminToggle(user)}
                                        disabled={user.id === authUser?.uid}
                                        aria-label={`Toggle admin status for ${user.userName}`}
                                    />
                                </TableCell>
                                 <TableCell className="text-right">
                                    <GiftGemsDialog user={user} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
