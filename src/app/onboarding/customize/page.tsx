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
import type { Archetype } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SKIN_TONES, type BodyType, type SkinTone } from '@/lib/avatar-system';

const formSchema = z.object({
  gender: z.enum(['Female', 'Male'], {
    required_error: 'Please select a gender.',
  }),
  bodyType: z.enum(['slim', 'average', 'athletic', 'plus'], {
    required_error: 'Please select a body type.',
  }),
  skinTone: z.enum(['pale', 'light', 'medium', 'tan', 'deep', 'dark'], {
    required_error: 'Please select a skin tone.',
  }),
  style: z.enum(['1', '2', '3'], {
    required_error: 'Please select a style.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

function AvatarPreview({ control }: { control: any }) {
  const gender = useWatch({ control, name: 'gender' }) as 'Male' | 'Female';
  const bodyType = useWatch({ control, name: 'bodyType' }) as BodyType;
  const skinTone = useWatch({ control, name: 'skinTone' }) as SkinTone;
  const style = useWatch({ control, name: 'style' });

  const skinColor = SKIN_TONES[skinTone || 'medium'];
  
  // Body width based on body type
  const bodyWidth = {
    slim: 35,
    average: 45,
    athletic: 50,
    plus: 60,
  }[bodyType || 'average'];

  // Hair styles
  const hairColors = ['#8B4513', '#FFD700', '#000000'];
  const hairColor = hairColors[parseInt(style || '1') - 1];

  return (
    <Card className="w-full max-w-sm shrink-0">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Your Twinskie</CardTitle>
        <CardDescription>This is your starting vessel. It will evolve as you do.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-4">
        <svg
          width="240"
          height="360"
          viewBox="0 0 200 300"
          className="rounded-lg border-2 border-primary shadow-lg bg-background"
        >
          {/* Simple preview - same structure as main component */}
          <g>
            {/* Torso */}
            <rect
              x={100 - bodyWidth / 2}
              y="120"
              width={bodyWidth}
              height="120"
              rx="10"
              fill={skinColor}
              stroke="currentColor"
              strokeWidth="2"
            />
            
            {/* Arms */}
            <rect
              x={100 - bodyWidth / 2 - 15}
              y="130"
              width="12"
              height="90"
              rx="6"
              fill={skinColor}
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x={100 + bodyWidth / 2 + 3}
              y="130"
              width="12"
              height="90"
              rx="6"
              fill={skinColor}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Legs */}
            <rect
              x="75"
              y="240"
              width="18"
              height="55"
              rx="9"
              fill={skinColor}
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="107"
              y="240"
              width="18"
              height="55"
              rx="9"
              fill={skinColor}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Head */}
            <circle
              cx="100"
              cy="90"
              r="35"
              fill={skinColor}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Hair */}
            <ellipse
              cx="100"
              cy="70"
              rx="38"
              ry="25"
              fill={hairColor}
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Eyes */}
            <circle cx="88" cy="88" r="4" fill="currentColor" />
            <circle cx="112" cy="88" r="4" fill="currentColor" />

            {/* Mouth */}
            <line
              x1="92"
              y1="105"
              x2="108"
              y2="105"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
        </svg>
      </CardContent>
    </Card>
  );
}

export default function CustomizeAvatarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'Female',
      bodyType: 'average',
      skinTone: 'medium',
      style: '1',
    },
  });

  async function onSubmit(values: FormValues) {
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
    
    // Create avatar style string: gender-bodyType-skinTone-style
    const avatarStyle = `${values.gender.toLowerCase()}-${values.bodyType}-${values.skinTone}-${values.style}`;
    
    updateDocumentNonBlocking(userRef, {
      gender: values.gender,
      avatarStyle,
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
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Design Your Twinskie</h1>
        <p className="text-muted-foreground mt-2">Your digital soul awaits...</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-6xl">
        <AvatarPreview control={form.control} />

        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Gender */}
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
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Female" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Male" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Body Type */}
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
                          className="grid grid-cols-2 gap-3"
                        >
                          {(['slim', 'average', 'athletic', 'plus'] as const).map((type) => (
                            <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={type} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer capitalize">
                                {type}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skin Tone */}
                <FormField
                  control={form.control}
                  name="skinTone"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Skin Tone</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-2 flex-wrap"
                        >
                          {(Object.keys(SKIN_TONES) as SkinTone[]).map((tone) => (
                            <FormItem key={tone} className="flex items-center space-x-0 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={tone} className="sr-only" />
                              </FormControl>
                              <FormLabel
                                className={cn(
                                  'cursor-pointer w-12 h-12 rounded-full border-2 transition-all',
                                  field.value === tone
                                    ? 'border-primary ring-2 ring-primary scale-110'
                                    : 'border-border hover:scale-105'
                                )}
                                style={{ backgroundColor: SKIN_TONES[tone] }}
                                title={tone}
                              />
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Style */}
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Hair Style</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-3"
                        >
                          {['1', '2', '3'].map((styleNum) => {
                            const colors = ['#8B4513', '#FFD700', '#000000'];
                            return (
                              <FormItem
                                key={styleNum}
                                className="flex items-center space-x-0 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem value={styleNum} className="sr-only" />
                                </FormControl>
                                <FormLabel
                                  className={cn(
                                    'cursor-pointer w-16 h-16 rounded-md border-2 transition-all flex items-center justify-center',
                                    field.value === styleNum
                                      ? 'border-primary ring-2 ring-primary'
                                      : 'border-border'
                                  )}
                                >
                                  <div
                                    className="w-12 h-12 rounded-full"
                                    style={{ backgroundColor: colors[parseInt(styleNum) - 1] }}
                                  />
                                </FormLabel>
                              </FormItem>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-bold group"
                >
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
