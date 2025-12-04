
'use client';

import { useDoc, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User, Trait, Log, Skill } from '@/lib/types';
import { TRAIT_ICONS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '../ui/skeleton';
import { Trophy, BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { assignPersonalityTraits } from '@/ai/flows/assign-personality-traits';
import { useToast } from '@/hooks/use-toast';

export function TraitBadges() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

    const traitsCollectionRef = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
    const { data: allTraits, isLoading: areTraitsLoading } = useCollection<Trait>(traitsCollectionRef);

    const handleSyncTraits = async () => {
        if (!user || !userRef || !authUser || !allTraits) return;
        setIsSyncing(true);

        try {
            // 1. Fetch recent logs
            const logsCollectionRef = collection(firestore, `users/${authUser.uid}/logs`);
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const logsQuery = query(logsCollectionRef, where('timestamp', '>=', thirtyDaysAgo));
            const logsSnapshot = await getDocs(logsQuery);
            const logs = logsSnapshot.docs.map(d => d.data() as Log);

            // 2. Fetch all skills to map log.skillId to category
            const skillsSnapshot = await getDocs(collection(firestore, 'skills'));
            const skillsMap = new Map<string, Skill>(skillsSnapshot.docs.map(d => [d.id, d.data() as Skill]));

            const logsWithCategory = logs.map(log => ({
                ...log,
                category: skillsMap.get(log.skillId)?.category || 'Unknown'
            }));

            // 3. Call the AI flow
            const result = await assignPersonalityTraits({
                user: {
                    id: user.id,
                    traits: user.traits,
                    momentumFlameActive: user.momentumFlameActive,
                    createdAt: user.createdAt,
                },
                logs: logsWithCategory,
                allTraits: allTraits,
            });

            // 4. Update user document in Firestore
            if (result.newlyAssignedTraits && result.newlyAssignedTraits.length > 0) {
                const updates: Record<string, boolean> = {};
                result.newlyAssignedTraits.forEach(traitId => {
                    updates[`traits.${traitId}`] = true;
                });
                await updateDoc(userRef, updates);
                toast({
                    title: "Personality Matrix Recalibrated!",
                    description: `You've earned ${result.newlyAssignedTraits.length} new trait(s).`
                });
            } else {
                toast({
                    title: "No New Traits",
                    description: "Your personality profile is up to date."
                });
            }

        } catch (error) {
            console.error("Failed to sync traits:", error);
            toast({
                variant: 'destructive',
                title: "Sync Failed",
                description: "Could not recalibrate your personality matrix at this time."
            });
        } finally {
            setIsSyncing(false);
        }
    };


    if (isUserLoading || areTraitsLoading) {
        return <Skeleton className="h-10 w-full mt-4" />;
    }

    const earnedTraitIds = user?.traits ? Object.keys(user.traits).filter(traitId => user.traits?.[traitId] === true) : [];
    
    // Handle the special 'state_best' trait which is not in the global collection
    const earnedTraits = earnedTraitIds.map(traitId => {
        if (traitId === 'state_best') {
            return { id: 'state_best', name: 'State Best', description: 'Your state was the top performer in a recent Faction Challenge.', icon: 'state_best' };
        }
        return allTraits?.find(t => t.id === traitId);
    }).filter((t): t is Trait => !!t);


    return (
        <TooltipProvider>
            <div className="flex flex-col items-center gap-2 mt-4 border-t pt-4 w-full">
                {earnedTraits.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {earnedTraits.map(trait => {
                            const Icon = TRAIT_ICONS[trait.icon as keyof typeof TRAIT_ICONS] || Trophy;
                            return (
                                <Tooltip key={trait.id}>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="text-base py-1 px-3 border-yellow-400/50">
                                            {Icon && <Icon className="w-4 h-4 mr-1 text-yellow-400"/>}
                                            {trait.name}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{trait.name}</p>
                                        <p>{trait.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No traits earned yet.</p>
                )}
                 <Button onClick={handleSyncTraits} disabled={isSyncing} variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-accent-foreground">
                    {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                    Recalibrate Personality Matrix
                </Button>
            </div>
        </TooltipProvider>
    );
}
