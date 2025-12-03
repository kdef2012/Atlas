
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CATEGORY_ICONS, CATEGORY_COLORS, type Skill, type User, type SkillCategory } from '@/lib/types';
import { useUser, useDoc, useMemoFirebase, useFirestore, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { collection, doc, increment } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Check, Key, Loader2, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SkillPopoverContentProps {
  node: Skill;
}

export function SkillPopoverContent({ node }: SkillPopoverContentProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const { data: skills } = useCollection<Skill>(skillsCollectionRef);

  if (!user || !skills) {
    return (
      <PopoverContent className="w-80 border-primary bg-background/80 backdrop-blur-sm">
        <Loader2 className="mx-auto animate-spin" />
      </PopoverContent>
    );
  }

  const Icon = CATEGORY_ICONS[node.category as SkillCategory];
  const color = CATEGORY_COLORS[node.category as SkillCategory] || 'gray';
  const isPioneer = node.pioneerUserId === user.id;
  
  // Calculate cost adjustments based on traits
  let finalCost = node.cost?.points ?? 0;
  if (user.traits?.specialist && node.cost?.category === user.archetype) {
      finalCost = Math.round(finalCost * 0.9); // 10% discount
  }
  if (user.traits?.jack_of_all_trades) {
      finalCost = Math.round(finalCost * 0.95); // 5% discount
  }

  const isUnlocked = user.userSkills?.[node.id]?.isUnlocked === true;
  const prereqsMet = node.prerequisites?.every(prereqId => user.userSkills?.[prereqId]?.isUnlocked) ?? true;
  const userStat = user[`${node.cost?.category.toLowerCase()}Stat` as keyof User] as number || 0;
  const hasEnoughPoints = node.cost ? userStat >= finalCost : true;
  const canUnlock = !isUnlocked && prereqsMet && hasEnoughPoints;

  const handleUnlockSkill = async () => {
    if (!canUnlock || !node.cost || !userRef) return;

    setIsUnlocking(true);
    try {
      const updates = {
        [`${node.cost.category.toLowerCase()}Stat`]: increment(-finalCost),
        [`userSkills.${node.id}.isUnlocked`]: true,
      };

      updateDocumentNonBlocking(userRef, updates);

      toast({
        title: 'Skill Unlocked!',
        description: `You have mastered the skill of ${node.name}.`,
      });
    } catch (error) {
      console.error("Failed to unlock skill:", error);
      toast({
        variant: 'destructive',
        title: 'Unlock Failed',
        description: 'Could not unlock the skill. Please try again.',
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <PopoverContent className="w-80 border-primary bg-background/80 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: color.replace(')', ' / 0.1)'), color }}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-headline">{node.name}</h3>
          <p className="text-sm text-muted-foreground">{node.description || "A skill waiting to be mastered."}</p>
          {isPioneer && <p className="text-xs font-bold text-accent neon-text mt-1">YOU ARE THE PIONEER OF THIS SKILL</p>}
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="text-xs text-muted-foreground space-y-2">
          {node.prerequisites && node.prerequisites.length > 0 && (
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-bold">Prerequisites:</p>
                <ul className="list-disc pl-4">
                  {node.prerequisites.map(id => (
                    <li key={id} className={cn(user.userSkills?.[id]?.isUnlocked ? 'text-green-400' : 'text-red-400')}>
                      {skills?.find(s => s.id === id)?.name || 'Unknown Skill'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {node.cost && (
            <div className="flex items-start gap-2">
              <Key className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-bold">Cost:</p>
                <p className={cn(hasEnoughPoints ? 'text-green-400' : 'text-red-400')}>
                  {finalCost} {node.cost.category} Points (You have: {userStat})
                  {(finalCost < node.cost.points) && <span className="ml-2 text-accent text-xs">(Discounted!)</span>}
                </p>
              </div>
            </div>
          )}
        </div>

        {isUnlocked ? (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Check className="mr-2" />
            Unlocked
          </Button>
        ) : !prereqsMet ? (
             <Button variant="destructive" size="sm" className="w-full" disabled>
                Prerequisites not met
            </Button>
        ) : !hasEnoughPoints && node.cost ? (
            <Button asChild size="sm" className="w-full group" variant="secondary">
                <Link href="/quests">
                    Earn {node.cost.category} Points
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        ) : (
          <Button onClick={handleUnlockSkill} disabled={!canUnlock || isUnlocking} size="sm" className="w-full">
            {isUnlocking && <Loader2 className="mr-2 animate-spin" />}
            Unlock Skill
          </Button>
        )}
      </div>
    </PopoverContent>
  );
}
