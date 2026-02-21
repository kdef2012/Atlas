
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { useUser, useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import type { Quest } from "@/lib/quest";
import { Button } from "@/components/ui/button";
import { Loader2, Mountain, Bot, Zap } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { generateQuests } from '@/ai/flows/generate-quests';
import type { User, Archetype } from '@/lib/types';

function QuestList() {
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState<Archetype | null>(null);

    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

    const questsCollectionRef = useMemoFirebase(
        () => authUser ? collection(firestore, 'users', authUser.uid, 'quests') : null,
        [firestore, authUser]
    );
    const { data: quests, isLoading: areQuestsLoading } = useCollection<Quest>(questsCollectionRef);

    const isLoading = isAuthLoading || isUserDocLoading || areQuestsLoading;

    const handleGenerateQuests = async (archetype: Archetype) => {
        if (!user || !questsCollectionRef) return;
        
        setIsGenerating(archetype);
        try {
            const aiResult = await generateQuests({
                archetype: archetype,
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
                    userId: user.id,
                };
                addDocumentNonBlocking(questsCollectionRef, newQuest);
            });
            
            toast({
                title: "New Quests Forged!",
                description: `Your destiny has been updated with new ${archetype} challenges.`
            })

        } catch (error) {
            console.error("Failed to generate quests:", error);
            toast({
                variant: 'destructive',
                title: "The Oracle is Silent",
                description: "The Nebula was unable to manifest your quests. Please check your signal and try again.",
            })
        } finally {
            setIsGenerating(null);
        }
    }

    const questGenerationButtons = (
        <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => handleGenerateQuests('Titan')} disabled={!!isGenerating || !user} variant="outline" className="border-red-500/50 hover:bg-red-500/10 hover:text-red-400">
                {isGenerating === 'Titan' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mountain className="mr-2 h-4 w-4 text-red-500" />}
                Generate Titan Quests
            </Button>
            <Button onClick={() => handleGenerateQuests('Sage')} disabled={!!isGenerating || !user} variant="outline" className="border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400">
                {isGenerating === 'Sage' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4 text-blue-500" />}
                Generate Sage Quests
            </Button>
            <Button onClick={() => handleGenerateQuests('Maverick')} disabled={!!isGenerating || !user} variant="outline" className="border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-400">
                {isGenerating === 'Maverick' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 text-yellow-500" />}
                Generate Maverick Quests
            </Button>
        </div>
    )


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
                <p className="mb-4 font-headline uppercase tracking-widest opacity-50">Signal Missing: Quest Log Empty</p>
                <div className="flex justify-center">
                    {questGenerationButtons}
                </div>
            </div>
        )
    }

    const activeQuests = quests.filter(q => !q.isCompleted);
    const completedQuests = quests.filter(q => q.isCompleted);

    return (
        <div className="space-y-6">
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="font-headline text-2xl">Active Quests</h2>
                     {activeQuests.length < 3 && (
                        <div className="flex justify-center">
                             {questGenerationButtons}
                        </div>
                     )}
                </div>
                <div className="space-y-4">
                    {activeQuests.length > 0 ? (
                        activeQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-muted-foreground text-center italic py-8 border rounded-lg bg-secondary/10">No active quests in current frequency. Synchronize new objectives above.</p>
                    )}
                </div>
            </div>
             <div>
                <h2 className="font-headline text-2xl mb-2 opacity-50">Completed Chronology</h2>
                <div className="space-y-4 opacity-60">
                    {completedQuests.length > 0 ? (
                        completedQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-muted-foreground text-sm italic">You have not yet chronicled any completed quests.</p>
                    )}
                </div>
            </div>
        </div>
    )
}


export default function QuestsPage() {
    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Quest Log</CardTitle>
                <CardDescription>Your personal roadmap to mastery. Complete objectives to earn XP and expand your potential.</CardDescription>
            </CardHeader>
            <CardContent>
                <QuestList />
            </CardContent>
        </Card>
    );
}
