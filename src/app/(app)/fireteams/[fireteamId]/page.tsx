
'use client';

import { useDoc, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Fireteam, User } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FireteamChat } from '@/components/fireteams/FireteamChat';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Crown, ShieldOff, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TwinskieAvatarCompact } from '@/components/twinskie-avatar-compact';

function MemberList({ fireteam }: { fireteam: Fireteam }) {
    const firestore = useFirestore();
    const memberIds = Object.keys(fireteam.members);

    const membersQuery = useMemoFirebase(() => {
        if (memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', memberIds));
    }, [firestore, JSON.stringify(memberIds)]);

    const { data: members, isLoading } = useCollection<User>(membersQuery);

    if (isLoading) {
        return <div className="space-y-2">
            {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    }

    return (
        <TooltipProvider>
             <div className="space-y-2">
                {members?.map(member => {
                    const isOwner = member.id === fireteam.ownerId;
                    const isActive = member.lastLogTimestamp > Date.now() - (24 * 60 * 60 * 1000);
                    return (
                        <div key={member.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                            <Tooltip>
                                <TooltipTrigger>
                                     <TwinskieAvatarCompact user={member} size={32} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{member.userName} - {isActive ? 'Active' : 'Inactive'}</p>
                                </TooltipContent>
                            </Tooltip>
                            <div className="flex-1">
                                <span className="font-semibold text-sm flex items-center">
                                    {member.userName}
                                </span>
                            </div>
                            {isOwner && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Crown className="w-4 h-4 text-yellow-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>Fireteam Leader</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    )
                })}
            </div>
        </TooltipProvider>
    )
}

export default function FireteamDetailsPage({ params }: { params: { fireteamId: string } }) {
  const { fireteamId } = params;
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const fireteamRef = useMemoFirebase(() => doc(firestore, 'fireteams', fireteamId), [firestore, fireteamId]);
  const { data: fireteam, isLoading: isFireteamLoading } = useDoc<Fireteam>(fireteamRef);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const isLoading = isFireteamLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!fireteam) {
    return (
      <Alert variant="destructive">
        <ShieldOff className="h-4 w-4" />
        <AlertTitle>Fireteam Not Found</AlertTitle>
        <AlertDescription>This Fireteam does not exist or you do not have permission to view it.</AlertDescription>
      </Alert>
    );
  }
  
  if (user?.fireteamId !== fireteamId) {
      return (
        <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You are not a member of this Fireteam.</AlertDescription>
        </Alert>
      )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{fireteam.name}</CardTitle>
            <CardDescription>Your squad's command center.</CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="font-bold mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Roster</h4>
             <MemberList fireteam={fireteam} />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <FireteamChat fireteam={fireteam} />
      </div>
    </div>
  );
}
