'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase, useUser, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc, setDoc } from "firebase/firestore";
import type { User, Admin } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { TwinskieAvatarCompact } from "../TwinskiAvatarCompact";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { GiftGemsDialog } from "./GiftGemsDialog";
import { EditUserDialog } from "./EditUserDialog";
import { UserLogsDialog } from "./UserLogsDialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function UserList() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();
    const [resettingUserId, setResettingUserId] = useState<string | null>(null);

    const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersCollection);
    
    const adminsCollection = useMemoFirebase(() => collection(firestore, 'admins'), [firestore]);
    const { data: admins, isLoading: isLoadingAdmins } = useCollection<Admin>(adminsCollection);

    const adminMap = useMemo(() => {
        const map = new Record<string, boolean>();
        admins?.forEach(a => map[a.id] = true);
        return map;
    }, [admins]);

    const handleAdminToggle = (userToUpdate: User, currentIsAdmin: boolean) => {
        if (!authUser || authUser.uid === userToUpdate.id) return;
        
        const adminDocRef = doc(firestore, 'admins', userToUpdate.id);

        if (currentIsAdmin) {
            deleteDocumentNonBlocking(adminDocRef);
            toast({
                title: "Permissions Revoked",
                description: `${userToUpdate.userName} is no longer an Admin.`,
            });
        } else {
            const newAdmin: Admin = {
                id: userToUpdate.id,
                email: userToUpdate.email || '',
                userName: userToUpdate.userName,
                createdAt: Date.now(),
            };
            setDocumentNonBlocking(adminDocRef, newAdmin, { merge: true });
            toast({
                title: "Admin Promoted",
                description: `${userToUpdate.userName} has been granted Admin status.`,
            });
        }
    }

    const handleResetAvatar = async (userToReset: User) => {
        if (!authUser) return;
        
        setResettingUserId(userToReset.id);
        
        try {
            const userRef = doc(firestore, 'users', userToReset.id);
            
            await setDoc(userRef, {
                avatarUrl: null,
                baseAvatarUrl: null,
                avatarStyle: null,
                avatarLayers: {},
                aiGeneratedCosmetics: {},
                suggestedCosmetics: [],
            }, { merge: true });
            
            toast({
                title: "Avatar Reset Successfully",
                description: `${userToReset.userName}'s avatar has been cleared. They will go through onboarding on next login.`,
            });
        } catch (error) {
            console.error("Failed to reset avatar:", error);
            toast({
                variant: "destructive",
                title: "Reset Failed",
                description: "Could not reset the user's avatar. Please try again.",
            });
        } finally {
            setResettingUserId(null);
        }
    };

    const isLoading = isLoadingUsers || isLoadingAdmins;

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Overview</CardTitle>
                <CardDescription>A list of all users in the ATLAS system. Toggle the switch to promote citizens to Admin status.</CardDescription>
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
                        {users?.map(user => {
                            const isAdmin = !!adminMap[user.id];
                            return (
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
                                            checked={isAdmin}
                                            onCheckedChange={() => handleAdminToggle(user, isAdmin)}
                                            disabled={user.id === authUser?.uid}
                                            aria-label={`Toggle admin status for ${user.userName}`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <UserLogsDialog user={user} />
                                        <GiftGemsDialog user={user} />
                                        <EditUserDialog user={user} />
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    disabled={resettingUserId === user.id}
                                                    title="Reset Biological Signature"
                                                >
                                                    {resettingUserId === user.id ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCw className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Reset Avatar?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will clear {user.userName}'s avatar and force them to go through 
                                                        onboarding again on their next login. This action is useful for clearing 
                                                        biological interference.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleResetAvatar(user)}>
                                                        Reset Avatar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}