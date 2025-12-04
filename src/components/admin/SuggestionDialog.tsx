
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Lightbulb, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "../ui/textarea";
import { useUser, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Suggestion } from "@/lib/types";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";

const suggestionSchema = z.object({
  suggestion: z.string().min(10, 'Suggestion must be at least 10 characters.').max(500, 'Suggestion is too long.'),
});

export function SuggestionDialog() {
    const { user: authUser } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const suggestionsCollection = useMemoFirebase(() => collection(firestore, 'suggestions'), [firestore]);
    const [isOpen, setIsOpen] = useState(false);

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
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
                <Lightbulb className="mr-2 h-4 w-4" />
                Submit Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary"/> Submit an Idea</DialogTitle>
              <DialogDescription>
                Have a suggestion to improve ATLAS? Let us know! Your feedback helps shape the future of the app.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="suggestion"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea placeholder="I think it would be cool if..." rows={5} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                            Submit Suggestion
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
          </DialogContent>
        </Dialog>
    )
}
