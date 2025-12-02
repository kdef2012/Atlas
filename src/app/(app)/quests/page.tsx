
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Quest } from "@/lib/quest";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

function QuestList() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const questsCollectionRef = useMemoFirebase(
        () => user ? collection(firestore, 'users', user.uid, 'quests') : null,
        [firestore, user]
    );
    const { data: quests, isLoading: areQuestsLoading } = useCollection<Quest>(questsCollectionRef);

    const isLoading = isUserLoading || areQuestsLoading;

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
                <Button>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate New Quests
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
                <h2 className="font-headline text-2xl mb-2">Active Quests</h2>
                <div className="space-y-4">
                    {activeQuests.length > 0 ? (
                        activeQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
                    ) : (
                        <p className="text-muted-foreground">No active quests at the moment.</p>
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
