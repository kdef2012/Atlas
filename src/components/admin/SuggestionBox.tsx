
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { Suggestion, User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Lightbulb, Archive, Loader2, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';

const suggestionSchema = z.object({
  suggestion: z.string().min(10, 'Suggestion must be at least 10 characters.').max(500, 'Suggestion is too long.'),
});

function SuggestionForm() {
    const { user: authUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const suggestionsCollection = useMemoFirebase(() => collection(firestore, 'suggestions'), [firestore]);

    const form = useForm<z.infer<typeof suggestionSchema>>({
        resolver: zodResolver(suggestionSchema),
        defaultValues: { suggestion: '' },
    });

    async function onSubmit(values: z.infer<typeof suggestionSchema>) {
        if (!authUser || !suggestionsCollection) return;
        
        const newSuggestion: Omit<Suggestion, 'id'> = {
            suggestion: values.suggestion,
            userId: authUser.uid,
            userName: authUser.displayName || 'Anonymous',
            timestamp: Date.now(),
            isArchived: false,
        };

        addDocumentNonBlocking(suggestionsCollection, newSuggestion);
        toast({ title: 'Suggestion Submitted!', description: 'Thank you for your feedback.' });
        form.reset();
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Suggestion Box
                </CardTitle>
                <CardDescription>Have an idea to improve ATLAS? Share it!</CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <Textarea {...form.register('suggestion')} placeholder="I think it would be cool if..." />
                    {form.formState.errors.suggestion && <p className="text-sm text-destructive">{form.formState.errors.suggestion.message}</p>}
                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                        Submit
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}


export function SuggestionBox() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    
    const userRef = useMemoFirebase(() => authUser ? collection(firestore, 'users') : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

    const suggestionsQuery = useMemoFirebase(() => query(
        collection(firestore, 'suggestions'), 
        where('isArchived', '==', false), 
        orderBy('timestamp', 'desc')
    ), [firestore]);
    
    const { data: suggestions, isLoading: suggestionsLoading } = useCollection<Suggestion>(suggestionsQuery);
    
    const handleArchive = (id: string) => {
        const suggestionRef = collection(firestore, 'suggestions', id);
        updateDocumentNonBlocking(suggestionRef, { isArchived: true });
    };
    
    if (user && !user.isAdmin) {
        return <SuggestionForm />;
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
