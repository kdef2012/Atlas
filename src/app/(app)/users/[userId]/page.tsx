'use client';

import { useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import type { User, Trait, Skill, Log } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { StatsRadarChart } from '@/components/dashboard/StatsRadarChart';
import { Badge } from '@/components/ui/badge';
import { TRAIT_ICONS, CATEGORY_COLORS } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Shield, Trophy, Activity, Calendar } from 'lucide-react';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => doc(firestore, 'users', userId), [firestore, userId]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const traitsCollectionRef = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
  const { data: allTraits } = useCollection<Trait>(traitsCollectionRef);

  const logsQuery = useMemoFirebase(() => 
    query(collection(firestore, `users/${userId}/logs`), orderBy('timestamp', 'desc'), limit(5)),
    [firestore, userId]
  );
  const { data: recentLogs } = useCollection<Log>(logsQuery);

  const isLoading = isUserLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] lg:col-span-2 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
        <h2 className="text-2xl font-bold font-headline">User Signal Lost</h2>
        <p className="text-muted-foreground">This inhabitant of the ATLAS does not exist.</p>
      </div>
    );
  }

  const earnedTraitIds = user.traits ? Object.keys(user.traits).filter(id => user.traits?.[id]) : [];
  const earnedTraits = earnedTraitIds.map(id => allTraits?.find(t => t.id === id) || { id, name: id, icon: 'pioneer', description: '' });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="flex flex-col items-center p-6 text-center">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-headline text-3xl">{user.userName}</CardTitle>
            <CardDescription>Level {user.level} {user.archetype}</CardDescription>
          </CardHeader>
          <TwinskieAvatar user={user} size="lg" />
          
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase font-bold">Total XP</p>
                <p className="text-xl font-mono">{user.xp.toLocaleString()}</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase font-bold">Archetype</p>
                <p className="text-xl font-headline text-primary">{user.archetype}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {earnedTraits.map(trait => {
                const Icon = TRAIT_ICONS[trait.icon as keyof typeof TRAIT_ICONS] || Trophy;
                return (
                    <Badge key={trait.id} variant="outline" className="py-1 px-3 border-primary/20">
                        <Icon className="w-3 h-3 mr-1 text-primary" />
                        {trait.name}
                    </Badge>
                )
            })}
          </div>
        </Card>

        {/* Energy & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Energy Signature</CardTitle>
              <CardDescription>Mastery across the core skill categories.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="h-[250px]">
                        {/* We use a separate wrapper since StatsRadarChart typically uses the auth user */}
                        {/* For simplicity, we assume the component is adaptable or we'd create a PublicStatsChart */}
                        <div className="flex flex-col gap-3">
                            {([
                                { name: 'Physical', value: user.physicalStat },
                                { name: 'Mental', value: user.mentalStat },
                                { name: 'Social', value: user.socialStat },
                                { name: 'Practical', value: user.practicalStat },
                                { name: 'Creative', value: user.creativeStat },
                            ] as {name: string, value: number}[]).map(stat => (
                                <div key={stat.name} className="space-y-1">
                                    <div className="flex justify-between text-xs font-bold uppercase">
                                        <span>{stat.name}</span>
                                        <span>{stat.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary" 
                                            style={{ width: `${Math.min((stat.value / 500) * 100, 100)}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-secondary/20 p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                        <Activity className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
                        <h4 className="font-bold">Last Activity</h4>
                        <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(user.lastLogTimestamp, { addSuffix: true })}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Joined ATLAS {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    </div>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Feats</CardTitle>
                <CardDescription>Most recent accomplishments in the Nebula.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recentLogs && recentLogs.length > 0 ? recentLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-medium">Accomplished feat</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                            </span>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground py-8 italic text-sm">No recent logs detected in the signal.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
