
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useCollection, useDoc, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Fireteam, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, PlusCircle, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function FireteamList() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  const [updatingTeamId, setUpdatingTeamId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);
  
  const fireteamsCollection = useMemoFirebase(() => collection(firestore, 'fireteams'), [firestore]);
  const { data: fireteams, isLoading } = useCollection<Fireteam>(fireteamsCollection);

  const handleJoinFireteam = (team: Fireteam) => {
    if (!authUser || !user || user.fireteamId) {
      toast({ variant: 'destructive', title: 'Cannot Join Team', description: 'You are already in a Fireteam or not logged in.' });
      return;
    }
    if (Object.keys(team.members).length >= 5) {
      toast({ variant: 'destructive', title: 'Team Full', description: 'This Fireteam cannot accept new members.' });
      return;
    }
    setUpdatingTeamId(team.id);

    const fireteamRef = doc(firestore, 'fireteams', team.id);
    const userDocRef = doc(firestore, 'users', authUser.uid);
    const updatedMembers = { ...team.members, [authUser.uid]: true };
    
    // Update fireteam and user documents non-blockingly
    updateDocumentNonBlocking(fireteamRef, { members: updatedMembers });
    updateDocumentNonBlocking(userDocRef, { fireteamId: team.id });

    // Simulate a delay for better UX, then toast and reset
    setTimeout(() => {
        toast({
            title: 'Welcome to the Squad!',
            description: `You have successfully joined "${team.name}".`,
        });
        setUpdatingTeamId(null);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fireteams.map(team => {
        const memberCount = Object.keys(team.members).length;
        const isFull = memberCount >= 5;
        const isMember = user?.fireteamId === team.id;
        const canJoin = !user?.fireteamId && !isFull;
        const isUpdating = updatingTeamId === team.id;

        return (
          <Card key={team.id} className={cn("flex flex-col transition-all duration-300", isMember ? "border-primary shadow-primary/20" : "hover:border-primary/80")}>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs pt-1">
                <MapPin className="w-3 h-3" />
                {team.region}, {team.state}, {team.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/> Members</span>
                  <span className="font-bold">{memberCount} / 5</span>
              </div>
            </CardContent>
            <CardFooter>
                {isMember ? (
                     <Button variant="outline" disabled className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                        You are in this team
                    </Button>
                ) : canJoin ? (
                     <Button onClick={() => handleJoinFireteam(team)} disabled={isUpdating} className="w-full">
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Join Fireteam
                    </Button>
                ) : (
                    <Button variant="outline" disabled className="w-full">
                        {isFull ? 'Team Full' : 'Already in a team'}
                    </Button>
                )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export default function FireteamsPage() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const isLoading = isAuthLoading || isUserDocLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-3xl">Find a Fireteam</CardTitle>
          <CardDescription>Team up to amplify your progress. Browse existing teams or forge your own.</CardDescription>
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
