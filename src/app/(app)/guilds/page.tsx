
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useCollection, useDoc, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where, writeBatch, deleteField } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Guild, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, PlusCircle, MapPin, Loader2, CheckCircle, Building2, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/types';

const GUILD_LIMIT = 3;

function GuildList() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  const [updatingGuildId, setUpdatingGuildId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);
  
  const guildsQuery = useMemoFirebase(() => query(collection(firestore, 'guilds')), [firestore]);

  const { data: guilds, isLoading } = useCollection<Guild>(guildsQuery);

  const handleJoinGuild = (guild: Guild) => {
    if (!authUser || !userRef || !user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to join a Guild.' });
      return;
    }
    const currentGuildCount = user.guilds ? Object.keys(user.guilds).length : 0;
    if (currentGuildCount >= GUILD_LIMIT) {
        toast({ variant: 'destructive', title: 'Guild Limit Reached', description: `You can only join up to ${GUILD_LIMIT} guilds.` });
        return;
    }

    setUpdatingGuildId(guild.id);

    const guildRef = doc(firestore, 'guilds', guild.id);
    
    const batch = writeBatch(firestore);
    batch.update(userRef, { [`guilds.${guild.id}`]: true });
    batch.update(guildRef, { [`members.${authUser.uid}`]: true });
    
    batch.commit().then(() => {
        toast({
            title: 'Welcome to the Guild!',
            description: `You have pledged allegiance to "${guild.name}".`,
        });
    }).catch(error => {
        console.error("Failed to join guild: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not join guild.'});
    }).finally(() => {
        setUpdatingGuildId(null);
    });
  };
  
  const handleLeaveGuild = (guild: Guild) => {
    if (!authUser || !userRef) return;
    setUpdatingGuildId(guild.id);

    const guildRef = doc(firestore, 'guilds', guild.id);
    
    const batch = writeBatch(firestore);
    batch.update(userRef, { [`guilds.${guild.id}`]: deleteField() });
    batch.update(guildRef, { [`members.${authUser.uid}`]: deleteField() });

    batch.commit().then(() => {
        toast({
            title: 'Left Guild',
            description: `You have left "${guild.name}".`,
        });
    }).catch(error => {
        console.error("Failed to leave guild: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not leave guild.'});
    }).finally(() => {
        setUpdatingGuildId(null);
    });
  }

  if (isLoading || !user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!guilds || guilds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No Guilds have been established yet.</p>
        <p>Be the first to found one!</p>
      </div>
    );
  }

  const userGuilds = user.guilds || {};
  const userGuildCount = Object.keys(userGuilds).length;
  const canJoinMore = userGuildCount < GUILD_LIMIT;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guilds.map(guild => {
        const memberCount = Object.keys(guild.members).length;
        const isMember = userGuilds[guild.id];
        const isUpdating = updatingGuildId === guild.id;
        const Icon = CATEGORY_ICONS[guild.category];

        return (
          <Card key={guild.id} className={cn("flex flex-col transition-all duration-300", isMember ? "border-primary shadow-primary/20" : "hover:border-primary/80")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-6 h-6" /> {guild.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs pt-1">
                <MapPin className="w-3 h-3" />
                {guild.region}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/> Members</span>
                  <span className="font-bold">{memberCount}</span>
              </div>
            </CardContent>
            <CardFooter>
                {isMember ? (
                     <Button variant="destructive" onClick={() => handleLeaveGuild(guild)} disabled={isUpdating} className="w-full">
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Leave Guild
                    </Button>
                ) : canJoinMore ? (
                     <Button onClick={() => handleJoinGuild(guild)} disabled={isUpdating} className="w-full">
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Join Guild
                    </Button>
                ) : (
                    <Button variant="outline" disabled className="w-full">
                        Guild Limit Reached
                    </Button>
                )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export default function GuildsPage() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const isLoading = isAuthLoading || isUserDocLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Find a Guild
          </CardTitle>
          <CardDescription>Join up to {GUILD_LIMIT} communities of like-minded individuals.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/guilds/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Found a Guild
            </Link>
          </Button>
      </CardHeader>
      <CardContent>
        <GuildList />
      </CardContent>
    </Card>
  );
}

    