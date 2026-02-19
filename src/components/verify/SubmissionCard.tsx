'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X, ShieldAlert } from 'lucide-react';
import type { Log, Skill, User } from '@/lib/types';
import { useFirestore, updateDocumentNonBlocking, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, increment, deleteField } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const VINDICATOR_THRESHOLD = 50;

interface Submission {
    log: Log;
    skill: Skill;
    user: User;
}

interface SubmissionCardProps {
    submission: Submission;
    onVote: (logId: string) => void;
}

export function SubmissionCard({ submission, onVote }: SubmissionCardProps) {
    const { log, skill, user } = submission;
    const firestore = useFirestore();
    const { user: voter } = useUser(); // The user who is voting
    const voterRef = useMemoFirebase(() => voter ? doc(firestore, 'users', voter.uid) : null, [firestore, voter]);
    const { data: voterData } = useDoc<User>(voterRef);

    const { toast } = useToast();
    const [isVoting, setIsVoting] = useState(false);

    const handleVote = async (isPass: boolean) => {
        if (!voter || !voterRef || voterData === undefined) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to vote.'});
            return;
        }
        setIsVoting(true);
        const logRef = doc(firestore, `users/${log.userId}/logs`, log.id);
        const originalUserRef = doc(firestore, 'users', log.userId);

        try {
            let xpForVoter = 5;
            if (voterData?.traits?.vindicator) {
                xpForVoter = 10; // Vindicator bonus
            }

            if (isPass) {
                // If pass, mark as verified and grant XP to the original user
                updateDocumentNonBlocking(originalUserRef, {
                    xp: increment(log.xp)
                });
                updateDocumentNonBlocking(logRef, { isVerified: true });
                toast({
                    title: "Vote Cast: Pass",
                    description: `Verified "${skill.name}" for ${user.userName}. You earned ${xpForVoter} XP!`,
                });
            } else {
                // If fail, apply anti-cheat penalty ladder logic
                const currentFails = user.failedVerificationCount || 0;
                const newFails = currentFails + 1;
                
                let penaltyUpdate: any = {
                    failedVerificationCount: increment(1)
                };

                // Penalty Level 1: 5 Rejections
                if (newFails === 5) {
                    penaltyUpdate.xp = increment(-500); // Fixed XP deduction
                    toast({
                        variant: 'destructive',
                        title: "Penalty Imposed: Level 1",
                        description: `${user.userName} has been flagged for 5 failed verifications. Deducted 500 XP.`,
                    });
                }

                // Penalty Level 2: 10 Rejections (Mastery Reversion)
                if (newFails >= 10) {
                    // Halve total XP
                    penaltyUpdate.xp = Math.floor(user.xp * 0.5); 
                    
                    // Revert one random mastered skill if possible
                    const unlockedSkillIds = Object.keys(user.userSkills || {}).filter(sid => user.userSkills[sid].isUnlocked);
                    if (unlockedSkillIds.length > 0) {
                        const randomSkillToLock = unlockedSkillIds[Math.floor(Math.random() * unlockedSkillIds.length)];
                        penaltyUpdate[`userSkills.${randomSkillToLock}.isUnlocked`] = false;
                        
                        toast({
                            variant: 'destructive',
                            title: "Mastery Reverted!",
                            description: `Severe integrity failure detected for ${user.userName}. Halved XP and revoked a skill mastery.`,
                        });
                    }
                }

                updateDocumentNonBlocking(originalUserRef, penaltyUpdate);
                updateDocumentNonBlocking(logRef, { isVerified: true, xp: 0 }); // Nullify original log XP
                
                toast({
                    variant: 'destructive',
                    title: "Vote Cast: Fail",
                    description: `Rejected submission from ${user.userName}. You earned ${xpForVoter} XP for your judgment.`,
                });
            }
            
            // Reward the voter and check for Vindicator trait
            const voterUpdate: any = { 
                xp: increment(xpForVoter),
                verificationVotes: increment(1) 
            };
            
            const newVoteCount = (voterData?.verificationVotes || 0) + 1;

            if(newVoteCount >= VINDICATOR_THRESHOLD && !voterData?.traits?.vindicator) {
                voterUpdate['traits.vindicator'] = true;
                toast({ title: 'Trait Unlocked: Vindicator!', description: 'Your sharp judgment has been recognized.' });
            }

            updateDocumentNonBlocking(voterRef, voterUpdate);

            // Notify parent component to show the next submission
            onVote(log.id);

        } catch (error) {
            console.error("Failed to cast vote:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not cast your vote. Please try again.",
            });
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-center flex flex-col items-center gap-2">
                    <ShieldAlert className="w-10 h-10 text-primary opacity-50" />
                    <span>Does this count as "{skill.name || 'Unknown Skill'}"?</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed border-primary/20 relative group">
                    {log.verificationPhotoUrl ? (
                        <Image
                            src={log.verificationPhotoUrl}
                            alt={`Proof for ${skill.name}`}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground italic">No sensor data provided</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4 font-mono uppercase tracking-widest">
                    Citizen Signal: {user.userName || 'Anonymous'}
                </p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
                <Button variant="destructive" size="lg" onClick={() => handleVote(false)} disabled={isVoting} className="h-14 text-lg font-bold">
                    {isVoting ? <Loader2 className="mr-2 animate-spin" /> : <X className="mr-2" />}
                    REJECT
                </Button>
                <Button onClick={() => handleVote(true)} disabled={isVoting} size="lg" className="h-14 text-lg font-bold bg-green-600 hover:bg-green-700">
                    {isVoting ? <Loader2 className="mr-2 animate-spin" /> : <Check className="mr-2" />}
                    VERIFY
                </Button>
            </CardFooter>
        </Card>
    );
}
