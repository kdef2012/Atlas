
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase, useUser } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc, setDoc } from "firebase/firestore";
import type { User } from "@/lib/types";
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
import { useState } from "react";
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
    const { data: users, isLoading } = useCollection<User>(usersCollection);
    
    const handleAdminToggle = (userToUpdate: User) => {
        if (!authUser || authUser.uid === userToUpdate.id) return;
        
        // This is a placeholder as the `isAdmin` property does not exist on the User type.
        // In a real scenario, you'd update a separate 'admins' collection or use custom claims.
        const newAdminStatus = !false; // Placeholder for !userToUpdate.isAdmin

        toast({
            title: "Permissions Updated",
            description: `${userToUpdate.userName} has been ${newAdminStatus ? 'promoted to' : 'demoted from'} admin. (Simulated)`,
        });
    }

    const handleResetAvatar = async (userToReset: User) => {
        if (!authUser) return;
        
        setResettingUserId(userToReset.id);
        
        try {
            const userRef = doc(firestore, 'users', userToReset.id);
            
            // ✅ Reset avatar fields to force user through onboarding again
            await setDoc(userRef, {
                avatarUrl: null,
                baseAvatarUrl: null,
                avatarStyle: null,
                // Optionally clear cosmetics too
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
                                        checked={false} // The isAdmin property doesn't exist on User type
                                        onCheckedChange={() => handleAdminToggle(user)}
                                        disabled={user.id === authUser?.uid}
                                        aria-label={`Toggle admin status for ${user.userName}`}
                                    />
                                </TableCell>
                                 <TableCell className="text-right space-x-1">
                                    <UserLogsDialog user={user} />
                                    <GiftGemsDialog user={user} />
                                    <EditUserDialog user={user} />
                                    
                                    {/* ✅ NEW: Reset Avatar Button */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                disabled={resettingUserId === user.id}
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
                                                    onboarding again on their next login. This action is useful for users 
                                                    who were using Ready Player Me avatars.
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
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
