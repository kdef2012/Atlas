
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const formSchema = z.object({
  gender: z.enum(['Male', 'Female', 'Non-binary'], {
    required_error: 'Please select a gender.',
  }),
  bodyType: z.enum(['Slim', 'Athletic', 'Muscular'], {
    required_error: 'Please select a body type.',
  }),
});

export default function CustomizeAvatarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const baseAvatar = PlaceHolderImages.find(p => p.id === 'twinskie-default');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to customize your avatar.',
      });
      return;
    }
    setIsLoading(true);

    const userRef = doc(firestore, 'users', user.uid);
    
    updateDocumentNonBlocking(userRef, {
      gender: values.gender,
      bodyType: values.bodyType,
    });

    // Simulate a brief delay for the write to propagate before moving on
    setTimeout(() => {
        toast({
            title: 'Avatar Customized!',
            description: 'Your digital self has been forged.',
        });
        router.push(`/onboarding/welcome?archetype=${archetype}`);
        setIsLoading(false);
    }, 1000);
  }

  if (!user) {
    return <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>;
  }
  
  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Design Your Twinskie</h1>
            <p className="text-lg text-muted-foreground mt-2">This is the starting vessel for your digital self.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-4xl">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Your Avatar</CardTitle>
                    <CardDescription>This will evolve as you do.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    {baseAvatar && (
                        <Image
                            src={baseAvatar.imageUrl}
                            alt="Default avatar"
                            width={200}
                            height={200}
                            className="rounded-full border-4 border-primary"
                        />
                    )}
                </CardContent>
            </Card>

            <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Customize</CardTitle>
                <CardDescription>Select your starting form.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Male" />
                                </FormControl>
                                <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Female" />
                                </FormControl>
                                <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Non-binary" />
                                </FormControl>
                                <FormLabel className="font-normal">Non-binary</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="bodyType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Body Type</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                            >
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Slim" />
                                </FormControl>
                                <FormLabel className="font-normal">Slim</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Athletic" />
                                </FormControl>
                                <FormLabel className="font-normal">Athletic</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Muscular" />
                                </FormControl>
                                <FormLabel className="font-normal">Muscular</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full font-bold group">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Forge My Twinskie
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
    </main>
  );
}
