
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Quest } from "@/lib/quest";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateQuests } from '@/ai/flows/generate-quests';
import type { User } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';

function QuestList() {
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);

    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

    const questsCollectionRef = useMemoFirebase(
        () => authUser ? collection(firestore, 'users', authUser.uid, 'quests') : null,
        [firestore, authUser]
    );
    const { data: quests, isLoading: areQuestsLoading } = useCollection<Quest>(questsCollectionRef);

    const isLoading = isAuthLoading || isUserDocLoading || areQuestsLoading;

    const handleGenerateQuests = async () => {
        if (!user || !questsCollectionRef) return;
        
        setIsGenerating(true);
        try {
            const aiResult = await generateQuests({
                archetype: user.archetype,
                level: user.level,
                stats: {
                    physical: user.physicalStat,
                    mental: user.mentalStat,
                    social: user.socialStat,
                    practical: user.practicalStat,
                    creative: user.creativeStat,
                }
            });

            // Add the new quests to Firestore without blocking
            aiResult.quests.forEach(quest => {
                const newQuest: Omit<Quest, 'id'> = {
                    ...quest,
                    isCompleted: false,
                    userId: user.id, // Ensure userId is set
                };
                addDocumentNonBlocking(questsCollectionRef, newQuest);
            });
            
            toast({
                title: "New Quests Forged!",
                description: "Your destiny has been updated with new challenges."
            })

        } catch (error) {
            console.error("Failed to generate quests:", error);
            toast({
                variant: 'destructive',
                title: "The Oracle is Silent",
                description: "Could not generate new quests at this time. Please try again later.",
            })
        } finally {
            setIsGenerating(false);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (!quests || quests.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="mb-4">Your quest log is empty.</p>
                <Button onClick={handleGenerateQuests} disabled={isGenerating || !user}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isGenerating ? 'Generating...' : 'Generate New Quests'}
                </Button>
            </div>
        )
    }

    // Separate active and completed quests
    const activeQuests = quests.filter(q => !q.isCompleted);
    const completedQuests = quests.filter(q => q.isCompleted);

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-headline text-2xl">Active Quests</h2>
                     {activeQuests.length === 0 && (
                        <Button onClick={handleGenerateQuests} disabled={isGenerating || !user} size="sm" variant="outline">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isGenerating ? 'Generating...' : 'Generate More'}
                        </Button>
                     )}
                </div>
                <div className="space-y-4">
                    {activeQuests.length > 0 ? (
                        activeQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-muted-foreground">No active quests at the moment. Generate some more!</p>
                    )}
                </div>
            </div>
             <div>
                <h2 className="font-headline text-2xl mb-2">Completed Quests</h2>
                <div className="space-y-4">
                    {completedQuests.length > 0 ? (
                        completedQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-muted-foreground">You haven't completed any quests yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}


export default function QuestsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Quest Log</CardTitle>
                <CardDescription>Your objectives and adventures. Complete them to earn XP and rewards.</CardDescription>
            </CardHeader>
            <CardContent>
                <QuestList />
            </CardContent>
        </Card>
    );
}
