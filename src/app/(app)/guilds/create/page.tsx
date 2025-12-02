
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2, Building2 } from 'lucide-react';
import type { SkillCategory, User } from '@/lib/types';
import { CATEGORY_ICONS } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, 'Guild name must be at least 3 characters.').max(50, 'Guild name is too long.'),
  category: z.enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative'], {
    required_error: "Please select a category for your guild.",
  }),
  region: z.string().min(2, 'Please enter a valid city/region.'),
});

export default function CreateGuildPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      region: user?.region || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to found a Guild.',
      });
      return;
    }

    setIsLoading(true);
    
    const guildData = {
      ...values,
      ownerId: user.id,
      members: {
        [user.id]: true,
      },
    };
    
    const guildsCollection = collection(firestore, 'guilds');

    addDocumentNonBlocking(guildsCollection, guildData).then(newGuildDoc => {
        if (!newGuildDoc) {
            throw new Error("Failed to create guild document.");
        }

        const userDocRef = doc(firestore, 'users', user.id);
        updateDocumentNonBlocking(userDocRef, { guildId: newGuildDoc.id, region: values.region });

        toast({
            title: 'Guild Founded!',
            description: `The "${values.name}" Guild has been established.`,
        });

        router.push('/guilds');
    }).catch(error => {
        console.error('Failed to create Guild:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not found your Guild. Please try again.',
        });
    }).finally(() => {
        setIsLoading(false);
    });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Found a New Guild</CardTitle>
        <CardDescription>Establish a new community for like-minded individuals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guild Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Artisan's Collective" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Core Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a skill category..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {(Object.keys(CATEGORY_ICONS) as (SkillCategory | 'Guilds' | 'Challenge' | 'Streak' | 'Gems' | 'Verify')[]).filter(k => !['Guilds', 'Challenge', 'Streak', 'Gems', 'Verify'].includes(k)).map(cat => {
                                const Icon = CATEGORY_ICONS[cat as SkillCategory];
                                return (
                                    <SelectItem key={cat} value={cat}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            <span>{cat}</span>
                                        </div>
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
            <p className="text-sm text-muted-foreground">Your Guild will be founded in this region. Only users from this region will be able to see and join it initially.</p>
            <Button type="submit" disabled={isLoading || !user} className="w-full font-bold">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
              Found Guild
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
