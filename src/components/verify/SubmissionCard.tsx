

'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X } from 'lucide-react';
import type { Log, Skill, User } from '@/lib/types';
import { useFirestore, updateDocumentNonBlocking, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, increment } from 'firebase/firestore';
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
        const logRef = doc(firestore, 'users', log.userId, 'logs', log.id);

        try {
            if (isPass) {
                // If pass, mark as verified and grant XP to the original user
                const originalUserRef = doc(firestore, 'users', log.userId);
                updateDocumentNonBlocking(originalUserRef, {
                    xp: increment(log.xp)
                });
                updateDocumentNonBlocking(logRef, { isVerified: true });
                toast({
                    title: "Vote Cast: Pass",
                    description: `Verified "${skill.name}" for ${user.userName}. You earned 5 XP!`,
                });
            } else {
                // If fail, just mark as verified to remove from queue, but don't grant XP
                updateDocumentNonBlocking(logRef, { isVerified: true, xp: 0 }); // Nullify XP
                toast({
                    variant: 'destructive',
                    title: "Vote Cast: Fail",
                    description: `Rejected submission from ${user.userName}. You earned 5 XP for your judgment.`,
                });
            }
            
            // Reward the voter and check for Vindicator trait
            const voterUpdate: any = { 
                xp: increment(5),
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
            // No need to set isVoting to false, as the component will be unmounted
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center">Does this count as "{skill.name || 'Unknown Skill'}"?</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed">
                    {log.verificationPhotoUrl ? (
                        <Image
                            src={log.verificationPhotoUrl}
                            alt={`Proof for ${skill.name}`}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No image provided</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Submitted by {user.userName || 'Anonymous'}
                </p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
                <Button variant="destructive" size="lg" onClick={() => handleVote(false)} disabled={isVoting}>
                    {isVoting ? <Loader2 className="mr-2 animate-spin" /> : <X className="mr-2" />}
                    Fail
                </Button>
                <Button onClick={() => handleVote(true)} disabled={isVoting} size="lg" className="bg-green-600 hover:bg-green-700">
                    {isVoting ? <Loader2 className="mr-2 animate-spin" /> : <Check className="mr-2" />}
                    Pass
                </Button>
            </CardFooter>
        </Card>
    );
}

    