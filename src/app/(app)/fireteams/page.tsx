
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useDoc, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Fireteam, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, PlusCircle, MapPin } from 'lucide-react';

function FireteamList() {
  const firestore = useFirestore();
  const fireteamsCollection = useMemoFirebase(() => collection(firestore, 'fireteams'), [firestore]);
  const { data: fireteams, isLoading } = useCollection<Fireteam>(fireteamsCollection);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!fireteams || fireteams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No Fireteams have been forged yet.</p>
        <p>Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fireteams.map(team => (
        <Card key={team.id} className="hover:border-primary/80 transition-colors">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              {team.region}, {team.state}, {team.country}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-bold">{Object.keys(team.members).length} / 5</span>
            </div>
             {/* Future: Add more details like collective XP, rank, etc. */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FireteamsPage() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading } = useDoc<User>(userRef);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-3xl">Fireteams</CardTitle>
          <CardDescription>Team up to amplify your progress.</CardDescription>
        </div>
        {!isLoading && !user?.fireteamId && (
           <Button asChild>
            <Link href="/fireteams/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Fireteam
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <FireteamList />
      </CardContent>
    </Card>
  );
}
