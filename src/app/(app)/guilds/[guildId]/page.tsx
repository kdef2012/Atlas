
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Guild, User } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldOff, Crown, User as UserIcon } from 'lucide-react';
import { GuildChat } from '@/components/guilds/GuildChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ScrollArea } from '@/components/ui/scroll-area';

function MemberList({ guild }: { guild: Guild }) {
    const firestore = useFirestore();
    const memberIds = Object.keys(guild.members);
    const membersQuery = useMemoFirebase(() => {
        if (memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', memberIds));
    }, [firestore, memberIds]);

    const { data: members, isLoading } = useCollection<User>(membersQuery);
    const avatarData = PlaceHolderImages.find(p => p.id === 'avatar');

    if (isLoading) {
        return <div className="space-y-2">
            {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
    }

    return (
        <ScrollArea className="h-96">
            <div className="space-y-2">
                {members?.map(member => (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={avatarData?.imageUrl} data-ai-hint={avatarData?.imageHint} />
                            <AvatarFallback>{member.userName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-semibold text-sm">{member.userName}</span>
                        {member.id === guild.ownerId && <Crown className="w-4 h-4 text-yellow-400" />}
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

export default function GuildDetailsPage() {
  const params = useParams();
  const guildId = params.guildId as string;
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const guildRef = useMemoFirebase(() => doc(firestore, 'guilds', guildId), [firestore, guildId]);
  const { data: guild, isLoading: isGuildLoading } = useDoc<Guild>(guildRef);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const isLoading = isGuildLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!guild) {
    return (
      <Alert variant="destructive">
        <ShieldOff className="h-4 w-4" />
        <AlertTitle>Guild Not Found</AlertTitle>
        <AlertDescription>This Guild does not exist or you do not have permission to view it.</AlertDescription>
      </Alert>
    );
  }
  
  if (user?.guildId !== guildId) {
      return (
        <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You are not a member of this Guild.</AlertDescription>
        </Alert>
      )
  }

  const memberCount = Object.keys(guild.members).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{guild.name}</CardTitle>
            <CardDescription>{guild.region} Chapter</CardDescription>
          </CardHeader>
          <CardContent>
             <h4 className="font-bold mb-2 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Members ({memberCount})</h4>
             <MemberList guild={guild} />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <GuildChat guild={guild} />
      </div>
    </div>
  );
}

    