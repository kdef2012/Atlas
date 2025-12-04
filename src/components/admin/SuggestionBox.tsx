
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase, updateDocumentNonBlocking, useUser, useDoc } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import type { Suggestion, User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Lightbulb, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SuggestionBox() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user: authUser } = useUser();
    
    // Get user document to check admin status
    const userRef = useMemoFirebase(
        () => authUser ? doc(firestore, 'users', authUser.uid) : null,
        [firestore, authUser]
    );
    const { data: userData, isLoading: userLoading } = useDoc<User>(userRef);
    
    // ✅ Only create query if user is admin
    const suggestionsQuery = useMemoFirebase(() => {
        return userData?.isAdmin ? query(
            collection(firestore, 'suggestions'), 
            where('isArchived', '==', false), 
            orderBy('timestamp', 'desc')
        ) : null;
    }, [firestore, userData?.isAdmin]);
    
    const { data: suggestions, isLoading: suggestionsLoading } = useCollection<Suggestion>(suggestionsQuery);
    
    const handleArchive = (id: string) => {
        const suggestionRef = doc(firestore, 'suggestions', id);
        updateDocumentNonBlocking(suggestionRef, { isArchived: true });
        toast({
            title: 'Suggestion Archived',
            description: 'The suggestion has been moved to the archive.'
        });
    };

    // Wait for user document to load
    if (userLoading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Suggestion Box
                    </CardTitle>
                    <CardDescription>Feedback and ideas from the community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ✅ Don't render if not admin
    if (!userData?.isAdmin) {
        return null;
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Suggestion Box
                </CardTitle>
                <CardDescription>Feedback and ideas from the community.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-96 pr-4">
                    {suggestionsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : suggestions && suggestions.length > 0 ? (
                        <div className="space-y-4">
                            {suggestions.map(s => (
                                <div key={s.id} className="p-3 rounded-md bg-secondary text-secondary-foreground text-sm group">
                                    <p className="font-semibold">{s.suggestion}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                        <span>by {s.userName} - {formatDistanceToNow(s.timestamp, { addSuffix: true })}</span>
                                        <Button onClick={() => handleArchive(s.id)} variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                            <Archive className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                            <p>No new suggestions.</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
