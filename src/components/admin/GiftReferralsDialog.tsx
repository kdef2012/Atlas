
'use client';

/**
 * @fileOverview Administrative tool to adjust user referral counts.
 * Critical for testing "The Recruiter" bounty logic in production environments.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { Loader2, UserPlus, Send } from 'lucide-react';
import type { User } from '@/lib/types';

const formSchema = z.object({
  amount: z.coerce.number().int().min(-50, 'Cannot remove more than 50 referrals.').max(50, 'Cannot add more than 50 referrals.'),
});

interface GiftReferralsDialogProps {
  user: User;
}

export function GiftReferralsDialog({ user }: GiftReferralsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const userRef = doc(firestore, 'users', user.id);
    updateDocumentNonBlocking(userRef, { referralCount: increment(values.amount) });
    
    toast({
      title: 'Referral Credits Updated',
      description: `Adjusted ${user.userName}'s referral count by ${values.amount}.`,
    });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Adjust Referrals">
            <UserPlus className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Referral Management: {user.userName}</DialogTitle>
          <DialogDescription>
            Manually adjust the number of successful invites attributed to this citizen.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Current Count: {user.referralCount || 0} / 4
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Apply Changes
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
