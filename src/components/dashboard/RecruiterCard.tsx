'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { UserPlus, Share2, Sparkles, Loader2, PartyPopper, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const RECRUIT_GOAL = 4;
const BOUNTY_XP = 5000;

export function RecruiterCard() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading } = useDoc<User>(userRef);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    
    // Dynamically use the current origin to ensure the link is reachable
    const inviteLink = `${window.location.origin}/login?ref=${authUser?.uid}`;
    
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Invite Signal Broadcast!',
      description: 'Referral link copied to clipboard. Share it with 4 friends to claim your bounty.',
    });
  };

  const handleClaimBounty = async () => {
    if (!userRef || !user) return;
    setIsClaiming(true);

    const updates = {
      xp: increment(BOUNTY_XP),
      recruiterBonusClaimed: true,
      'traits.recruiter': true
    };

    updateDocumentNonBlocking(userRef, updates);

    setTimeout(() => {
      toast({
        title: 'Bounty Synchronized!',
        description: (
          <div className="flex flex-col gap-1">
            <p className="font-bold text-accent">+{BOUNTY_XP.toLocaleString()} XP Granted</p>
            <p className="text-xs">Trait Unlocked: The Recruiter</p>
          </div>
        ),
      });
      setIsClaiming(false);
    }, 1500);
  };

  if (isLoading || !user) return null;

  const referralCount = user.referralCount || 0;
  const progress = Math.min((referralCount / RECRUIT_GOAL) * 100, 100);
  const isGoalReached = referralCount >= RECRUIT_GOAL;
  const isClaimed = user.recruiterBonusClaimed;

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden",
      isGoalReached && !isClaimed && "border-accent ring-2 ring-accent/20 animate-pulse"
    )}>
      {isGoalReached && !isClaimed && (
        <div className="absolute top-2 right-2">
          <Zap className="w-5 h-5 text-accent animate-bounce" />
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <UserPlus className="text-primary" />
          The Recruiter
        </CardTitle>
        <CardDescription>
          Assemble your squad. Invite exactly {RECRUIT_GOAL} friends to ATLAS to claim a massive XP bounty.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
            <span>Squad Formation</span>
            <span className={cn(isGoalReached ? "text-accent" : "text-primary")}>
              {referralCount} / {RECRUIT_GOAL}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-primary/10">
          <div className="p-2 rounded-full bg-accent/10 text-accent">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-tighter">Squad Bounty</p>
            <p className="text-sm font-black text-accent">{BOUNTY_XP.toLocaleString()} XP</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {isClaimed ? (
          <Button variant="outline" disabled className="w-full font-bold">
            <PartyPopper className="mr-2 h-4 w-4 text-accent" />
            Bounty Claimed
          </Button>
        ) : isGoalReached ? (
          <Button onClick={handleClaimBounty} disabled={isClaiming} className="w-full font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
            {isClaiming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Claim Squad Bounty
          </Button>
        ) : (
          <Button onClick={handleShare} variant="outline" className="w-full font-bold border-primary/20">
            <Share2 className="mr-2 h-4 w-4" />
            Broadcast Invite Signal
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
