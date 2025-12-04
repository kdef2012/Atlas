
'use client';

import { useDoc, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Guild, User, Trait, Skill, Fireteam } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldOff, User as UserIcon } from 'lucide-react';
import { GuildChat } from '@/components/guilds/GuildChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TRAIT_ICONS, CATEGORY_ICONS } from '@/lib/types';
import { TwinskieAvatarCompact } from '@/components/twinskie-avatar-compact';

function MemberList({ guild, members }: { guild: Guild, members: User[] }) {
    const firestore = useFirestore();
    
    const traitsCollectionRef = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
    const { data: allTraits, isLoading: areTraitsLoading } = useCollection<Trait>(traitsCollectionRef);
    
    const getEarnedTraits = (user: User) => {
        const earnedTraitIds = user.traits ? Object.keys(user.traits).filter(traitId => user.traits?.[traitId] === true) : [];
        return earnedTraitIds.map(traitId => {
            if (traitId === 'state_best') {
                return { id: 'state_best', name: 'State Best', icon: 'state_best' };
            }
            return allTraits?.find(t => t.id === traitId);
        }).filter((t): t is Trait => !!t).slice(0, 3); // Show max 3 traits
    }
    
    if (areTraitsLoading) {
        return <div className="space-y-2">
            {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
    }

    return (
        <TooltipProvider>
            <ScrollArea className="h-96">
                <div className="space-y-2">
                    {members?.map(member => (
                        <div key={member.id} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                             <TwinskieAvatarCompact user={member} size={32} showLevel />
                            <div className="flex-1">
                                <span className="font-semibold text-sm flex items-center">
                                    {member.userName}
                                </span>
                                <div className="flex gap-1 mt-1">
                                     {getEarnedTraits(member).map(trait => {
                                        const Icon = TRAIT_ICONS[trait.icon as keyof typeof TRAIT_ICONS];
                                        return (
                                            <Tooltip key={trait.id}>
                                                <TooltipTrigger>
                                                    <Badge variant="secondary" className="px-1.5 py-0.5"><Icon className="w-3 h-3 text-yellow-400"/></Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>{trait.name}</TooltipContent>
                                            </Tooltip>
                                        )
                                     })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </TooltipProvider>
    )
}

export default function GuildDetailsPage({ params }: { params: { guildId: string } }) {
  const { guildId } = params;
  const firestore = useFirestore();
  const { user: authUser } = useUser();

  const guildRef = useMemoFirebase(() => doc(firestore, 'guilds', guildId), [firestore, guildId]);
  const { data: guild, isLoading: isGuildLoading } = useDoc<Guild>(guildRef);
  
  const skillRef = useMemoFirebase(() => guild ? doc(firestore, 'skills', guild.skillId) : null, [firestore, guild]);
  const { data: skill, isLoading: isSkillLoading } = useDoc<Skill>(skillRef);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);
  
  const memberIds = guild?.members ? Object.keys(guild.members) : [];
  const membersQuery = useMemoFirebase(() => {
    if (!guild || memberIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('id', 'in', memberIds.slice(0, 30)));
  }, [firestore, guild, JSON.stringify(memberIds.slice(0, 30))]);
  const { data: members, isLoading: areMembersLoading } = useCollection<User>(membersQuery);

  const isLoading = isGuildLoading || isUserLoading || isSkillLoading || areMembersLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!guild || !skill) {
    return (
      <Alert variant="destructive">
        <ShieldOff className="h-4 w-4" />
        <AlertTitle>Guild Not Found</AlertTitle>
        <AlertDescription>This Guild does not exist or you do not have permission to view it.</AlertDescription>
      </Alert>
    );
  }
  
  // Updated check for multi-guild membership
  if (!user?.guilds?.[guildId]) {
      return (
        <Alert variant="destructive">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You are not a member of this Guild.</AlertDescription>
        </Alert>
      )
  }

  const memberCount = Object.keys(guild.members).length;
  const CategoryIcon = CATEGORY_ICONS[guild.category];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><CategoryIcon className="w-6 h-6"/>{guild.name}</CardTitle>
            <CardDescription>A global community dedicated to mastering "{skill.name}".</CardDescription>
          </CardHeader>
          <CardContent>
             <h4 className="font-bold mb-2 flex items-center gap-2"><UserIcon className="w-4 h-4"/> Members ({memberCount})</h4>
             <MemberList guild={guild} members={members || []} />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <GuildChat guild={guild} />
      </div>
    </div>
  );
}

    