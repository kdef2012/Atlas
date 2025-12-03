
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
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
import type { Archetype, Gender } from '@/lib/types';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const formSchema = z.object({
  gender: z.enum(['Female', 'Male'], {
    required_error: 'Please select a gender.',
  }),
  avatarStyle: z.string({
    required_error: 'Please select a style.',
  }),
});

const AVATAR_STYLES = [1, 2, 3];

function AvatarPreview({ control }: { control: any }) {
    const gender = useWatch({ control, name: 'gender' });
    const avatarStyle = useWatch({ control, name: 'avatarStyle' });

    const getAvatarUrl = () => {
        if (gender && avatarStyle) {
            const id = `avatar-${gender.toLowerCase()}-style${avatarStyle}`;
            const avatar = PlaceHolderImages.find(p => p.id === id);
            return avatar?.imageUrl;
        }
        // Return a default or the first available option
        const defaultId = `avatar-${gender?.toLowerCase() || 'female'}-style1`;
        return PlaceHolderImages.find(p => p.id === defaultId)?.imageUrl;
    }

    const imageUrl = getAvatarUrl();

    return (
        <Card className="w-full max-w-sm shrink-0">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Your Twinskie</CardTitle>
                <CardDescription>This is your starting vessel. It will evolve as you do.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-4">
                 {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt="Avatar preview"
                        width={300}
                        height={300}
                        className="rounded-lg border-2 border-primary shadow-lg"
                        key={imageUrl} 
                        priority
                    />
                ) : (
                    <div className="w-[300px] h-[300px] bg-secondary rounded-lg flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground"/>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function CustomizeAvatarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        gender: 'Female',
        avatarStyle: '1',
    }
  });

  const gender = form.watch('gender');

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
    
    // Get the full URL of the selected avatar
    const selectedAvatarId = `avatar-${values.gender.toLowerCase()}-style${values.avatarStyle}`;
    const selectedAvatar = PlaceHolderImages.find(p => p.id === selectedAvatarId);
    
    updateDocumentNonBlocking(userRef, {
      gender: values.gender,
      avatarStyle: values.avatarStyle,
      avatarUrl: selectedAvatar?.imageUrl || null, // Save the chosen URL
    });

    setTimeout(() => {
        toast({
            title: 'Avatar Forged!',
            description: 'Your digital self has been born.',
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

  const getStyleImage = (gender: 'Female' | 'Male', style: number): ImagePlaceholder | undefined => {
    return PlaceHolderImages.find(p => p.id === `avatar-${gender.toLowerCase()}-style${style}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">Design Your Twinskie</h1>
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
            <AvatarPreview control={form.control} />

            <Card className="w-full max-w-md">
            <CardContent className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={(value) => { field.onChange(value); form.setValue('avatarStyle', '1'); }} defaultValue={field.value} className="flex space-x-4">
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Female" /></FormControl>
                                    <FormLabel className="font-normal">Female</FormLabel>
                                </FormItem>
                                 <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Male" /></FormControl>
                                    <FormLabel className="font-normal">Male</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="avatarStyle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Style</FormLabel>
                            <ScrollArea>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2 pb-4">
                                    {AVATAR_STYLES.map(styleNum => {
                                        const styleImg = getStyleImage(gender, styleNum);
                                        return styleImg ? (
                                            <FormItem key={styleNum} className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={String(styleNum)} className="sr-only" />
                                                </FormControl>
                                                <FormLabel className={cn(
                                                    "cursor-pointer rounded-md border-2 border-transparent transition-all",
                                                    field.value === String(styleNum) && "border-primary ring-2 ring-primary"
                                                )}>
                                                    <Image 
                                                        src={styleImg.imageUrl} 
                                                        alt={styleImg.description}
                                                        width={100}
                                                        height={100}
                                                        className="h-24 w-24 rounded-md object-cover"
                                                    />
                                                </FormLabel>
                                            </FormItem>
                                        ) : null
                                    })}
                                </RadioGroup>
                            </FormControl>
                            <ScrollBar orientation="horizontal" />
                            </ScrollArea>
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
