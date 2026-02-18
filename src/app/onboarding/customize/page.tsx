'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowRight, Sparkles, Check, ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { removeBackground } from '@/actions/removeBackground';
import { generateBaseAvatar } from '@/actions/generateBaseAvatar';
import { SKIN_TONES, MALE_HAIR_STYLES, FEMALE_HAIR_STYLES, BODY_TYPES, HEIGHTS } from '@/lib/avatar-options';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function CustomizeAvatarPage() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Form State
  const [gender, setGender] = useState<'Male' | 'Female' | 'Non-Binary'>('Male');
  const [complexion, setComplexion] = useState(SKIN_TONES[1]);
  const [hairStyle, setHairStyle] = useState(MALE_HAIR_STYLES[0]);
  const [bodyType, setBodyType] = useState('Average');
  const [height, setHeight] = useState('Medium');

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const currentHairStyles = useMemo(() => {
    if (gender === 'Female') return FEMALE_HAIR_STYLES;
    if (gender === 'Male') return MALE_HAIR_STYLES;
    return [...MALE_HAIR_STYLES, ...FEMALE_HAIR_STYLES].sort();
  }, [gender]);

  // Reset hair style if it's not in the current list
  useMemo(() => {
    if (!currentHairStyles.includes(hairStyle)) {
      setHairStyle(currentHairStyles[0]);
    }
  }, [currentHairStyles, hairStyle]);

  const handleGenerate = async () => {
    setIsProcessing(true);
    setAvatarUrl(null);
    toast({
      title: 'Synthesizing DNA...',
      description: 'The ATLAS is rendering your base Twinskie. Please wait.',
    });

    try {
      // Step 1: Generate the base image with uniform background
      const genResult = await generateBaseAvatar({
        gender,
        complexionName: complexion.name,
        complexionHex: complexion.hex,
        hairStyle,
        bodyType,
        height,
      });

      // Step 2: Automatically remove the background for a clean transparent PNG
      toast({
        title: 'Optimizing for the Nebula...',
        description: 'Removing background and isolating biological signature.',
      });
      const removeResult = await removeBackground({ imageDataUri: genResult.imageDataUri });

      setAvatarUrl(removeResult.transparentImageDataUri);
      toast({
        title: '✅ Optimization Complete!',
        description: 'Your base Twinskie is ready for deployment.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'The system encountered an error. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceed = async (skipped: boolean = false) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'User not found.' });
      return;
    }
    if (!avatarUrl && !skipped) {
      toast({ variant: 'destructive', title: 'Avatar Not Set', description: 'Please forge your Twinskie first.' });
      return;
    }

    setIsLoading(true);
    const userRef = doc(firestore, 'users', user.uid);
    const updates: any = { avatarStyle: 'guided_forge' };

    if (avatarUrl) {
      updates.avatarUrl = avatarUrl;
      updates.baseAvatarUrl = avatarUrl;
    }

    updateDocumentNonBlocking(userRef, updates);

    setTimeout(() => {
      toast({ title: '🎮 Welcome to ATLAS!', description: 'Your Twinskie has been synchronized.' });
      router.push(`/onboarding/welcome?archetype=${archetype}`);
      setIsLoading(false);
    }, 1000);
  };

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
        <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Forge Your Twinskie
        </h1>
        <p className="text-muted-foreground mt-2">Describe your physical form to calibrate the ATLAS system.</p>
      </div>

      <div className="w-full max-w-2xl">
        <Card className="border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>Calibration Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-secondary h-1 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 min-h-[400px] flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold font-headline">Biological Origin</h3>
                  <p className="text-sm text-muted-foreground">Select your base gender identity.</p>
                </div>
                <RadioGroup 
                  value={gender} 
                  onValueChange={(v: any) => setGender(v)} 
                  className="grid grid-cols-3 gap-4"
                >
                  {['Male', 'Female', 'Non-Binary'].map((g) => (
                    <div key={g}>
                      <RadioGroupItem value={g} id={g} className="peer sr-only" />
                      <Label
                        htmlFor={g}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <span className="text-lg font-bold">{g}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold font-headline">Complexion</h3>
                  <p className="text-sm text-muted-foreground">Choose the skin tone that best represents you.</p>
                </div>
                <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.name}
                      onClick={() => setComplexion(tone)}
                      className={cn(
                        "group relative w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                        complexion.name === tone.name ? "border-primary scale-110 shadow-lg ring-2 ring-primary/20" : "border-transparent"
                      )}
                      style={{ backgroundColor: tone.hex }}
                      title={tone.name}
                    >
                      {complexion.name === tone.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="text-white drop-shadow-md w-6 h-6" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center font-bold text-primary">{complexion.name}</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold font-headline">Hair Presentation</h3>
                  <p className="text-sm text-muted-foreground">Select a style that matches your preferred look.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                  <Label>Select Style</Label>
                  <Select value={hairStyle} onValueChange={setHairStyle}>
                    <SelectTrigger className="h-12 text-lg font-medium">
                      <SelectValue placeholder="Choose a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentHairStyles.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-headline">Physical Build</h3>
                  <p className="text-sm text-muted-foreground">Define your stature and body composition.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest font-bold">Body Type</Label>
                    <Select value={bodyType} onValueChange={setBodyType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BODY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest font-bold">Height</Label>
                    <Select value={height} onValueChange={setHeight}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {HEIGHTS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!avatarUrl && !isProcessing && (
                  <Button 
                    onClick={handleGenerate} 
                    className="w-full h-12 text-lg font-bold animate-pulse hover:animate-none"
                  >
                    <Wand2 className="mr-2" />
                    Synthesize Twinskie
                  </Button>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm font-bold text-primary animate-pulse">ATLAS SYSTEM CALIBRATING...</p>
                  </div>
                )}

                {avatarUrl && (
                  <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 fade-in">
                    <div className="relative w-48 h-48 rounded-2xl bg-secondary/50 border-2 border-primary/20 overflow-hidden shadow-inner flex items-center justify-center">
                      <img src={avatarUrl} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                    </div>
                    <Button onClick={handleGenerate} variant="outline" size="sm">
                      Re-synthesize Form
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6 bg-secondary/10">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || isProcessing || isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleProceed(true)} disabled={isLoading || isProcessing}>
                  Skip
                </Button>
                <Button 
                  onClick={() => handleProceed(false)} 
                  disabled={isLoading || isProcessing || !avatarUrl}
                  className="font-bold px-8"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enter the ATLAS
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
