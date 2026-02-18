
'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, Sparkles, Check, ChevronRight, ChevronLeft, Wand2 } from 'lucide-react';
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

  // Handle step changes
  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleGenerate = async () => {
    setIsProcessing(true);
    setAvatarUrl(null);
    toast({
      title: 'Synthesizing DNA...',
      description: 'The ATLAS is rendering your base Twinskie. Please wait.',
    });

    try {
      const genResult = await generateBaseAvatar({
        gender,
        complexionName: complexion.name,
        complexionHex: complexion.hex,
        hairStyle,
        bodyType,
        height,
      });

      toast({
        title: 'Optimizing for the Nebula...',
        description: 'Removing background and isolating biological signature.',
      });
      const removeResult = await removeBackground({ imageDataUri: genResult.imageDataUri });

      setAvatarUrl(removeResult.transparentImageDataUri);
      toast({
        title: '✅ Calibration Complete!',
        description: 'Your base Twinskie is ready for deployment.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Calibration Failed',
        description: 'The system encountered an interference. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceed = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'User session not found.' });
      return;
    }
    if (!avatarUrl) {
      toast({ variant: 'destructive', title: 'System Incomplete', description: 'Please synthesize your form before proceeding.' });
      return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const updates = { 
        avatarStyle: 'guided_forge',
        avatarUrl: avatarUrl,
        baseAvatarUrl: avatarUrl,
        gender: gender === 'Non-Binary' ? undefined : gender 
      };

      // Use blocking update here to ensure AppLayout sees the change before redirecting
      await updateDoc(userRef, updates);

      toast({ title: '🎮 System Synchronized!', description: 'Your journey into ATLAS begins now.' });
      router.push(`/onboarding/welcome?archetype=${archetype}`);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not sync your system profile.' });
    } finally {
      setIsLoading(false);
    }
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
          System Calibration
        </h1>
        <p className="text-muted-foreground mt-2">Define your physical parameters to initialize the ATLAS interface.</p>
      </div>

      <div className="w-full max-w-2xl">
        <Card className="border-primary/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-secondary/30 border-b">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 ease-in-out" 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-10 min-h-[450px] flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-headline mb-2">Biological Origin</h3>
                  <p className="text-sm text-muted-foreground">Select your base identity for character synthesis.</p>
                </div>
                <RadioGroup 
                  value={gender} 
                  onValueChange={(v: any) => {
                    setGender(v);
                    setHairStyle(v === 'Female' ? FEMALE_HAIR_STYLES[0] : MALE_HAIR_STYLES[0]);
                  }} 
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  {['Male', 'Female', 'Non-Binary'].map((g) => (
                    <div key={g}>
                      <RadioGroupItem value={g} id={g} className="peer sr-only" />
                      <Label
                        htmlFor={g}
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent/50 hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
                      >
                        <span className="text-lg font-bold">{g}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-headline mb-2">Complexion</h3>
                  <p className="text-sm text-muted-foreground">Choose the tone that matches your real-world physicality.</p>
                </div>
                <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.name}
                      onClick={() => setComplexion(tone)}
                      className={cn(
                        "group relative w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                        complexion.name === tone.name ? "border-primary scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-4 ring-primary/20" : "border-transparent"
                      )}
                      style={{ backgroundColor: tone.hex }}
                      title={tone.name}
                    >
                      {complexion.name === tone.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1 shadow-lg">
                            <Check className="text-black w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center font-bold text-primary tracking-widest uppercase text-sm">{complexion.name}</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-headline mb-2">Hair Presentation</h3>
                  <p className="text-sm text-muted-foreground">Select a stylistic presentation from the ATLAS archives.</p>
                </div>
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Available Styles</Label>
                    <Select value={hairStyle} onValueChange={setHairStyle}>
                      <SelectTrigger className="h-14 text-lg font-medium border-2 focus:ring-primary">
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
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-headline mb-2">Final Synthesis</h3>
                  <p className="text-sm text-muted-foreground">Review build parameters and generate your base interface.</p>
                </div>
                
                {!avatarUrl && !isProcessing && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Stature</Label>
                        <Select value={height} onValueChange={setHeight}>
                          <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {HEIGHTS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Build</Label>
                        <Select value={bodyType} onValueChange={setBodyType}>
                          <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {BODY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleGenerate} 
                      className="w-full h-16 text-xl font-black uppercase tracking-tighter group hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all"
                    >
                      <Wand2 className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                      Synthesize Twinskie
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center gap-6 py-10">
                    <div className="relative">
                      <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
                      <Sparkles className="absolute inset-0 h-20 w-20 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-black text-primary tracking-[0.2em] animate-pulse">ATLAS CORE ACTIVE</p>
                      <p className="text-xs text-muted-foreground font-mono">Synthesizing biological data streams...</p>
                    </div>
                  </div>
                )}

                {avatarUrl && (
                  <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
                      <div className="relative w-56 h-56 rounded-3xl bg-secondary/30 border-2 border-primary/20 overflow-hidden shadow-2xl flex items-center justify-center">
                        <img src={avatarUrl} alt="Preview" className="max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => setAvatarUrl(null)} variant="outline" size="sm" className="font-bold border-2" disabled={isLoading}>
                        Re-calibrate
                      </Button>
                      <Button onClick={handleProceed} size="sm" className="font-bold border-2 border-primary group px-8" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Confirm Profile
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6 bg-secondary/10">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1 || isProcessing || isLoading}
              className="font-bold uppercase tracking-tighter"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {step < 4 && (
              <Button onClick={nextStep} className="font-bold uppercase tracking-tighter px-10">
                Proceed <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
