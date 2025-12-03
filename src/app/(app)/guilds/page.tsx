
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useCollection, useDoc, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, deleteField } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Guild, User, Skill } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Loader2, CheckCircle, Building2, LogOut, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

const GUILD_LIMIT = 3;
const UNLOCK_XP_THRESHOLD = 1000;

function GuildCard({
  guild,
  skill,
  user,
  onJoin,
  onLeave,
  isLocked,
  isMember,
  canJoinMore,
  isUpdating
}: {
  guild: Guild,
  skill?: Skill,
  user: User,
  onJoin: (guild: Guild) => void,
  onLeave: (guild: Guild) => void,
  isLocked: boolean,
  isMember: boolean,
  canJoinMore: boolean,
  isUpdating: boolean
}) {
  const Icon = CATEGORY_ICONS[guild.category];
  const memberCount = Object.keys(guild.members).length;
  const userSkillXP = user.userSkills?.[guild.skillId]?.xp || 0;
  const progress = Math.min((userSkillXP / UNLOCK_XP_THRESHOLD) * 100, 100);

  return (
    <Card className={cn("flex flex-col transition-all duration-300", 
      isMember ? "border-primary shadow-primary/20" : "hover:border-primary/80",
      isLocked && "bg-secondary/30 border-dashed"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-6 h-6" /> {guild.name}
        </CardTitle>
        <CardDescription>A community for masters of {skill?.name || 'an unknown skill'}.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/> Members</span>
          <span className="font-bold">{memberCount}</span>
        </div>
        {isLocked && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Unlock Progress</span>
              <span>{userSkillXP} / {UNLOCK_XP_THRESHOLD} XP</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isLocked ? (
          <Button variant="outline" disabled className="w-full">
            <Lock className="mr-2 h-4 w-4" />
            Locked
          </Button>
        ) : isMember ? (
          <Button variant="destructive" onClick={() => onLeave(guild)} disabled={isUpdating} className="w-full">
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Leave Guild
          </Button>
        ) : canJoinMore ? (
          <Button onClick={() => onJoin(guild)} disabled={isUpdating} className="w-full">
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
}


function GuildList() {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const { toast } = useToast();
  const [updatingGuildId, setUpdatingGuildId] = useState<string | null>(null);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);
  
  const guildsCollection = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
  const { data: guilds, isLoading: isLoadingGuilds } = useCollection<Guild>(guildsCollection);

  const skillsCollection = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const { data: skills, isLoading: isLoadingSkills } = useCollection<Skill>(skillsCollection);
  
  const isLoading = isLoadingGuilds || isLoadingSkills || !user;

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (!guilds || guilds.length === 0 || !skills) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No Guilds have been established yet in ATLAS.</p>
        <p>Pioneer new skills to found the first ones!</p>
      </div>
    );
  }
  
  const skillsMap = new Map(skills.map(s => [s.id, s]));
  const userGuilds = user.guilds || {};
  const userGuildCount = Object.keys(userGuilds).length;
  const canJoinMore = userGuildCount < GUILD_LIMIT;

  const sortedGuilds = [...guilds].sort((a,b) => {
    const aUnlocked = (user.userSkills?.[a.skillId]?.xp || 0) >= UNLOCK_XP_THRESHOLD;
    const bUnlocked = (user.userSkills?.[b.skillId]?.xp || 0) >= UNLOCK_XP_THRESHOLD;
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.name.localeCompare(b.name);
  })
  
  const unlockedGuilds = sortedGuilds.filter(g => (user.userSkills?.[g.skillId]?.xp || 0) >= UNLOCK_XP_THRESHOLD);
  const lockedGuilds = sortedGuilds.filter(g => (user.userSkills?.[g.skillId]?.xp || 0) < UNLOCK_XP_THRESHOLD);

  const renderGuildList = (list: Guild[]) => list.map(guild => (
      <GuildCard 
        key={guild.id}
        guild={guild}
        skill={skillsMap.get(guild.skillId)}
        user={user}
        onJoin={handleJoinGuild}
        onLeave={handleLeaveGuild}
        isLocked={(user.userSkills?.[guild.skillId]?.xp || 0) < UNLOCK_XP_THRESHOLD}
        isMember={!!userGuilds[guild.id]}
        canJoinMore={canJoinMore}
        isUpdating={updatingGuildId === guild.id}
      />
    ));

  return (
    <div className="space-y-8">
        <div>
            <h2 className="font-headline text-2xl mb-4">Unlocked Guilds</h2>
            {unlockedGuilds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderGuildList(unlockedGuilds)}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-8">You haven't unlocked any guilds yet. Keep practicing your skills!</p>
            )}
        </div>
         <div>
            <h2 className="font-headline text-2xl mb-4">Locked Guilds</h2>
            {lockedGuilds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderGuildList(lockedGuilds)}
                </div>
            ) : (
                 <p className="text-muted-foreground text-center py-8">You've unlocked every Guild in ATLAS! Incredible!</p>
            )}
        </div>
    </div>
  );
}

export default function GuildsPage() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            Guild Directory
          </CardTitle>
          <CardDescription>Earn your place in up to {GUILD_LIMIT} communities by mastering their core skill.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <GuildList />
      </CardContent>
    </Card>
  );
}
