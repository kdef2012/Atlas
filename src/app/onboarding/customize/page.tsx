'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowRight, Sparkles, User2, Palette, Smile } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  encodeAvatarConfig,
  SKIN_TONE_COLORS,
  HAIR_COLOR_VALUES,
  type OpenPeepsConfig,
  type SkinTone,
  type HairColor,
  type BodyPose,
  type EyeStyle,
  type MouthStyle,
  type HairStyle,
  type FacialHairStyle,
} from '@/lib/avatar-system-openpeeps';
import { TwinskieAvatar } from '@/components/twinskie-avatar-openpeeps';

const formSchema = z.object({
  gender: z.enum(['Female', 'Male']),
  skinTone: z.enum(['light', 'yellow', 'brown', 'dark', 'red', 'black']),
  body: z.enum(['standing', 'sitting', 'arms-crossed', 'hands-in-pockets', 'pointing']),
  head: z.enum(['default', 'round', 'square', 'long']),
  eyes: z.enum(['normal', 'happy', 'content', 'squint', 'simple', 'dizzy', 'wink', 'hearts']),
  eyebrows: z.enum(['up', 'down', 'eyelashesUp', 'eyelashesDown', 'left', 'leftLowered']),
  mouth: z.enum(['frown', 'lips', 'nervous', 'pucker', 'sad', 'smile', 'smirk', 'surprised']),
  hair: z.enum(['none', 'long1', 'long2', 'short1', 'short2', 'short3', 'bun', 'curly', 'dreads', 'afro']),
  hairColor: z.enum(['black', 'brown', 'blonde', 'red', 'gray', 'blue', 'pink']),
  facialHair: z.enum(['none', 'stubble', 'mediumBeard', 'goatee']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
      skinTone: 'brown',
      body: 'standing',
      head: 'default',
      eyes: 'normal',
      eyebrows: 'up',
      mouth: 'smile',
      hair: 'short1',
      hairColor: 'brown',
      facialHair: 'none',
    },
  });

  const currentGender = form.watch('gender');

  // Create preview user object
  const previewUser = {
    id: 'preview',
    userName: 'Preview',
    level: 1,
    xp: 0,
    archetype: archetype || 'Sage',
    email: null,
    avatarStyle: encodeAvatarConfig({
      gender: form.watch('gender'),
      skinTone: form.watch('skinTone'),
      body: form.watch('body'),
      head: form.watch('head'),
      eyes: form.watch('eyes'),
      eyebrows: form.watch('eyebrows'),
      mouth: form.watch('mouth'),
      hair: form.watch('hair'),
      hairColor: form.watch('hairColor'),
      facialHair: form.watch('facialHair'),
    } as OpenPeepsConfig),
    physicalStat: 10,
    mentalStat: 10,
    socialStat: 10,
    practicalStat: 10,
    creativeStat: 10,
    lastLogTimestamp: Date.now(),
    createdAt: Date.now(),
    userSkills: {},
    momentumFlameActive: true,
    gems: 0,
    streakFreezes: 0,
  } as any;

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
    
    const avatarConfig: OpenPeepsConfig = {
      gender: values.gender,
      skinTone: values.skinTone,
      body: values.body,
      head: values.head,
      eyes: values.eyes,
      eyebrows: values.eyebrows,
      mouth: values.mouth,
      hair: values.hair,
      hairColor: values.hairColor,
      facialHair: values.facialHair,
    };
    
    updateDocumentNonBlocking(userRef, {
      gender: values.gender,
      avatarStyle: encodeAvatarConfig(avatarConfig),
    });

    setTimeout(() => {
      toast({
        title: '✨ Twinskie Forged!',
        description: 'Your digital soul has been born. Welcome to ATLAS.',
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Design Your Twinskie
        </h1>
        <p className="text-muted-foreground mt-2">Create your digital soul - make it uniquely yours</p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-7xl">
        {/* Preview */}
        <Card className="w-full max-w-sm shrink-0">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Live Preview
            </CardTitle>
            <CardDescription>Your Twinskie will evolve as you grow</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <TwinskieAvatar 
              user={previewUser}
              size="lg"
              showEvolutionBadge={false}
            />
          </CardContent>
        </Card>

        {/* Customization Form */}
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basics" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basics">
                      <User2 className="w-4 h-4 mr-2" />
                      Basics
                    </TabsTrigger>
                    <TabsTrigger value="face">
                      <Smile className="w-4 h-4 mr-2" />
                      Face
                    </TabsTrigger>
                    <TabsTrigger value="style">
                      <Palette className="w-4 h-4 mr-2" />
                      Style
                    </TabsTrigger>
                  </TabsList>

                  {/* Basics Tab */}
                  <TabsContent value="basics" className="space-y-6 mt-6">
                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              {['Female', 'Male'].map((gender) => (
                                <div key={gender}>
                                  <RadioGroupItem value={gender} id={`gender-${gender}`} className="sr-only" />
                                  <label
                                    htmlFor={`gender-${gender}`}
                                    className={cn(
                                      "flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === gender
                                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <span className="font-medium">{gender}</span>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Skin Tone */}
                    <FormField
                      control={form.control}
                      name="skinTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Skin Tone</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-6 gap-3">
                              {(Object.keys(SKIN_TONE_COLORS) as SkinTone[]).map((tone) => (
                                <div key={tone}>
                                  <RadioGroupItem value={tone} id={`skin-${tone}`} className="sr-only" />
                                  <label
                                    htmlFor={`skin-${tone}`}
                                    className={cn(
                                      "block w-full aspect-square rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === tone
                                        ? "border-primary ring-2 ring-primary scale-110"
                                        : "border-border hover:scale-105"
                                    )}
                                    style={{ backgroundColor: SKIN_TONE_COLORS[tone] }}
                                    title={tone}
                                  />
                                </div>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Body Pose */}
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Pose</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-3"
                            >
                              {(['standing', 'sitting', 'arms-crossed', 'hands-in-pockets'] as BodyPose[]).map((pose) => (
                                <div key={pose}>
                                  <RadioGroupItem value={pose} id={`pose-${pose}`} className="sr-only" />
                                  <label
                                    htmlFor={`pose-${pose}`}
                                    className={cn(
                                      "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === pose
                                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <span className="text-sm capitalize">{pose.replace('-', ' ')}</span>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Face Tab */}
                  <TabsContent value="face" className="space-y-6 mt-6">
                    {/* Eyes */}
                    <FormField
                      control={form.control}
                      name="eyes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Eyes</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-4 gap-3"
                            >
                              {(['normal', 'happy', 'content', 'squint', 'wink', 'hearts'] as EyeStyle[]).map((eye) => (
                                <div key={eye}>
                                  <RadioGroupItem value={eye} id={`eye-${eye}`} className="sr-only" />
                                  <label
                                    htmlFor={`eye-${eye}`}
                                    className={cn(
                                      "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === eye
                                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <span className="text-xs capitalize">{eye}</span>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Mouth */}
                    <FormField
                      control={form.control}
                      name="mouth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Mouth</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-4 gap-3"
                            >
                              {(['smile', 'frown', 'lips', 'smirk', 'surprised', 'nervous'] as MouthStyle[]).map((mouth) => (
                                <div key={mouth}>
                                  <RadioGroupItem value={mouth} id={`mouth-${mouth}`} className="sr-only" />
                                  <label
                                    htmlFor={`mouth-${mouth}`}
                                    className={cn(
                                      "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === mouth
                                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <span className="text-xs capitalize">{mouth}</span>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Facial Hair (Male only) */}
                    {currentGender === 'Male' && (
                      <FormField
                        control={form.control}
                        name="facialHair"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Facial Hair</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-4 gap-3"
                              >
                                {(['none', 'stubble', 'mediumBeard', 'goatee'] as FacialHairStyle[]).map((fh) => (
                                  <div key={fh}>
                                    <RadioGroupItem value={fh} id={`fh-${fh}`} className="sr-only" />
                                    <label
                                      htmlFor={`fh-${fh}`}
                                      className={cn(
                                        "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                                        field.value === fh
                                          ? "border-primary bg-primary/10 ring-2 ring-primary"
                                          : "border-border hover:border-primary/50"
                                      )}
                                    >
                                      <span className="text-xs capitalize">{fh === 'mediumBeard' ? 'Beard' : fh}</span>
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>

                  {/* Style Tab */}
                  <TabsContent value="style" className="space-y-6 mt-6">
                    {/* Hair Style */}
                    <FormField
                      control={form.control}
                      name="hair"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Hair Style</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-3 gap-3"
                            >
                              {(['none', 'short1', 'short2', 'short3', 'long1', 'long2', 'bun', 'curly', 'afro'] as HairStyle[]).map((hair) => (
                                <div key={hair}>
                                  <RadioGroupItem value={hair} id={`hair-${hair}`} className="sr-only" />
                                  <label
                                    htmlFor={`hair-${hair}`}
                                    className={cn(
                                      "flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === hair
                                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                                        : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <span className="text-xs capitalize">{hair}</span>
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Hair Color */}
                    <FormField
                      control={form.control}
                      name="hairColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Hair Color</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-7 gap-3">
                              {(Object.keys(HAIR_COLOR_VALUES) as HairColor[]).map((color) => (
                                <div key={color}>
                                  <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                                  <label
                                    htmlFor={`color-${color}`}
                                    className={cn(
                                      "block w-full aspect-square rounded-lg border-2 cursor-pointer transition-all",
                                      field.value === color
                                        ? "border-primary ring-2 ring-primary scale-110"
                                        : "border-border hover:scale-105"
                                    )}
                                    style={{ backgroundColor: HAIR_COLOR_VALUES[color] }}
                                    title={color}
                                  />
                                </div>
                              ))}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full font-bold group text-lg py-6"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Forge My Twinskie
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
