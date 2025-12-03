
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useUser, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { Fireteam, User } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FireteamChat } from '@/components/fireteams/FireteamChat';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldOff } from 'lucide-react';

export default function FireteamDetailsPage() {
  const params = useParams();
  const fireteamId = params.fireteamId as string;
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const fireteamRef = useMemoFirebase(() => doc(firestore, 'fireteams', fireteamId), [firestore, fireteamId]);
  const { data: fireteam, isLoading: isFireteamLoading } = useDoc<Fireteam>(fireteamRef);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const isLoading = isFireteamLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
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
            {/* We can add member list and other details here later */}
            <p>Details about the Fireteam will go here.</p>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <FireteamChat fireteam={fireteam} />
      </div>
    </div>
  );
}
