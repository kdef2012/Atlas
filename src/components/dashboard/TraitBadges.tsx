
'use client';

import { useDoc, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User, Trait } from '@/lib/types';
import { TRAIT_ICONS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '../ui/skeleton';
import { Trophy } from 'lucide-react';

export function TraitBadges() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

    const traitsCollectionRef = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
    const { data: allTraits, isLoading: areTraitsLoading } = useCollection<Trait>(traitsCollectionRef);

    if (isUserLoading || areTraitsLoading) {
        return <Skeleton className="h-10 w-full mt-4" />;
    }

    const earnedTraitIds = user?.traits ? Object.keys(user.traits).filter(traitId => user.traits?.[traitId] === true) : [];

    if (earnedTraitIds.length === 0) {
        return null; // Don't render anything if there are no traits
    }
    
    const earnedTraits = earnedTraitIds.map(traitId => {
        // Special case for state_best as it's not in the global collection
        if (traitId === 'state_best') {
            return {
                id: 'state_best',
                name: 'State Best',
                description: 'Your state was the top performer in a recent Faction Challenge.',
                icon: 'state_best'
            }
        }
        return allTraits?.find(t => t.id === traitId);
    }).filter((t): t is Trait => !!t);


    return (
        <TooltipProvider>
            <div className="flex flex-wrap gap-2 justify-center mt-4 border-t pt-4 w-full">
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
        </TooltipProvider>
    );
}
    
