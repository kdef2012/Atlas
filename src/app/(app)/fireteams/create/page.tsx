
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2, ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Fireteam name must be at least 3 characters.').max(50, 'Fireteam name is too long.'),
  region: z.string().min(2, 'Please enter a valid city/region.'),
  state: z.string().min(2, 'Please enter a valid state/province.'),
  country: z.string().min(2, 'Please enter a valid country.'),
});

export default function CreateFireteamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      region: '',
      state: '',
      country: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create a Fireteam.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create the new fireteam document
      const fireteamData = {
        ...values,
        ownerId: user.uid,
        members: {
          [user.uid]: true,
        },
        streakActive: false, // Default value
      };
      
      const fireteamsCollection = collection(firestore, 'fireteams');
      const newFireteamDoc = await addDocumentNonBlocking(fireteamsCollection, fireteamData);
      
      if (!newFireteamDoc) throw new Error("Failed to create fireteam document.");
      
      // Update the user's document with the new fireteamId
      const userRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userRef, { fireteamId: newFireteamDoc.id });

      toast({
        title: 'Fireteam Created!',
        description: (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span>The Fireteam "{values.name}" has been forged.</span>
          </div>
        ),
      });

      router.push('/fireteams');

    } catch (error) {
      console.error('Failed to create Fireteam:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create your Fireteam. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Forge a New Fireteam</CardTitle>
        <CardDescription>Assemble your squad and choose your territory.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fireteam Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Leapers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region (City)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading || !user} className="w-full font-bold">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Forge Fireteam
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
