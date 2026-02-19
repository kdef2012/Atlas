
'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Loader2, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Wand2, 
  User as UserIcon, 
  UserRound, 
  Users as UsersIcon, 
  Glasses as GlassesIcon, 
  Scissors, 
  Palette,
  CircleUser,
  ScanEye,
  Dna,
  CheckCircle2
} from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { removeBackground } from '@/actions/removeBackground';
import { generateBaseAvatar } from '@/actions/generateBaseAvatar';
import { uploadBaseAvatar } from '@/lib/uploadAvatar';
import { 
  SKIN_TONES, 
  HAIR_COLORS, 
  EYE_COLORS, 
  MALE_HAIR_STYLES, 
  FEMALE_HAIR_STYLES, 
  BODY_TYPES, 
  HEIGHTS, 
  AGE_RANGES, 
  FACIAL_HAIR_STYLES, 
  GLASSES_STYLES,
  type VisualOption
} from '@/lib/avatar-options';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function CustomizeAvatarPage() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);

  // Form State
  const [gender, setGender] = useState<'Male' | 'Female' | 'Non-Binary'>('Male');
  const [complexion, setComplexion] = useState(SKIN_TONES[1]);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [eyeColor, setEyeColor] = useState(EYE_COLORS[0]);
  const [hairStyle, setHairStyle] = useState(MALE_HAIR_STYLES[0].name);
  const [bodyType, setBodyType] = useState('Average');
  const [height, setHeight] = useState('Medium');
  const [ageRange, setAgeRange] = useState('Young Adult');
  const [facialHair, setFacialHair] = useState('Clean Shaven');
  const [glasses, setGlasses] = useState('None');

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const currentHairStyles = useMemo(() => {
    if (gender === 'Female') return FEMALE_HAIR_STYLES;
    if (gender === 'Male') return MALE_HAIR_STYLES;
    return [...MALE_HAIR_STYLES, ...FEMALE_HAIR_STYLES].sort((a, b) => a.name.localeCompare(b.name));
  }, [gender]);

  const nextStep = () => setStep(s => Math.min(5, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleGenerate = async () => {
    setIsProcessing(true);
    setAvatarDataUri(null);
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
        hairColor: hairColor.name,
        eyeColor: eyeColor.name,
        bodyType,
        height,
        ageRange,
        facialHair: gender === 'Female' ? 'Clean Shaven' : facialHair,
        glasses,
      });

      toast({
        title: 'Optimizing for the Nebula...',
        description: 'Removing background and isolating biological signature.',
      });
      const removeResult = await removeBackground({ imageDataUri: genResult.imageDataUri });

      setAvatarDataUri(removeResult.transparentImageDataUri);
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
    if (!avatarDataUri) {
      toast({ variant: 'destructive', title: 'System Incomplete', description: 'Please synthesize your form before proceeding.' });
      return;
    }

    setIsLoading(true);
    try {
      toast({
        title: 'Uploading to ATLAS Core...',
        description: 'Synchronizing biological data with cloud storage.',
      });

      const cloudAvatarUrl = await uploadBaseAvatar(avatarDataUri, user.uid);

      if (!cloudAvatarUrl || !cloudAvatarUrl.startsWith('https://')) {
        throw new Error("The ATLAS Core rejected the data stream. Please try again.");
      }

      const userRef = doc(firestore, 'users', user.uid);
      const updates = { 
        avatarStyle: 'guided_forge',
        avatarUrl: cloudAvatarUrl, 
        baseAvatarUrl: cloudAvatarUrl, 
        gender: gender === 'Non-Binary' ? 'Male' : gender 
      };

      await setDoc(userRef, updates, { merge: true });

      toast({ title: '🎮 System Synchronized!', description: 'Your journey into ATLAS begins now.' });
      router.push(`/onboarding/welcome?archetype=${archetype}`);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({ 
        variant: 'destructive', 
        title: 'Synchronization Failed', 
        description: error instanceof Error ? error.message : 'The ATLAS encountered a critical error saving your profile.' 
      });
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
        <p className="text-muted-foreground mt-2">Define your biological signature to initialize the ATLAS interface.</p>
      </div>

      <div className="w-full max-w-4xl">
        <Card className="border-primary/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-secondary/30 border-b">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>Step {step} of 5</span>
              <span>{Math.round((step / 5) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 ease-in-out" 
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 min-h-[550px] flex flex-col">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <CircleUser className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">Biological Origin</h3>
                  <p className="text-sm text-muted-foreground">Select your base identity for character synthesis.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { val: 'Male', icon: UserIcon },
                    { val: 'Female', icon: UsersIcon },
                    { val: 'Non-Binary', icon: UserRound }
                  ].map(({ val, icon: Icon }) => (
                    <button
                      key={val}
                      onClick={() => {
                        setGender(val as any);
                        setHairStyle(val === 'Female' ? FEMALE_HAIR_STYLES[0].name : MALE_HAIR_STYLES[0].name);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 p-6 transition-all duration-200",
                        gender === val 
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                          : "border-muted bg-popover hover:border-primary/50 hover:bg-accent/50"
                      )}
                    >
                      <Icon className={cn("w-12 h-12 mb-3", gender === val ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-lg font-bold">{val}</span>
                      {gender === val && <CheckCircle2 className="w-5 h-5 text-primary mt-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <Palette className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">Chromatic Signature</h3>
                  <p className="text-sm text-muted-foreground">Choose the tones that match your physical form.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center block">Skin Tone</Label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {SKIN_TONES.map((tone) => (
                        <button
                          key={tone.name}
                          onClick={() => setComplexion(tone)}
                          className={cn(
                            "group relative w-full aspect-square rounded-full border-2 transition-all hover:scale-110",
                            complexion.name === tone.name ? "border-primary scale-110 ring-4 ring-primary/20" : "border-transparent"
                          )}
                          style={{ backgroundColor: tone.hex }}
                          title={tone.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground block text-center">Hair Color</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {HAIR_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setHairColor(color)}
                            className={cn(
                              "w-full aspect-square rounded-lg border-2 transition-all hover:scale-110",
                              hairColor.name === color.name ? "border-primary scale-110 ring-4 ring-primary/20" : "border-transparent"
                            )}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground block text-center">Eye Color</Label>
                      <div className="grid grid-cols-5 gap-3">
                        {EYE_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setEyeColor(color)}
                            className={cn(
                              "w-full aspect-square rounded-lg border-2 transition-all hover:scale-110",
                              eyeColor.name === color.name ? "border-primary scale-110 ring-4 ring-primary/20" : "border-transparent"
                            )}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <Scissors className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">Visual Forge: Hair & Features</h3>
                  <p className="text-sm text-muted-foreground">Select your stylistic presentation from the ATLAS visual archives.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <Scissors className="w-3 h-3" /> Hair Style Gallery
                    </Label>
                    <ScrollArea className="h-[350px] border rounded-xl bg-secondary/20 p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {currentHairStyles.map(s => (
                          <button
                            key={s.name}
                            onClick={() => setHairStyle(s.name)}
                            className={cn(
                              "relative group flex flex-col items-center p-2 rounded-lg border-2 transition-all overflow-hidden",
                              hairStyle === s.name 
                                ? "border-primary bg-primary/10 shadow-md" 
                                : "border-transparent bg-card/50 hover:border-primary/30"
                            )}
                          >
                            <div className="w-full aspect-square relative mb-2 rounded-md overflow-hidden bg-secondary/50">
                                <img 
                                    src={s.imageUrl} 
                                    alt={s.name} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                    data-ai-hint={`${s.name} hairstyle`}
                                />
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-tight text-center truncate w-full", hairStyle === s.name ? "text-primary" : "text-muted-foreground")}>
                                {s.name}
                            </span>
                            {hairStyle === s.name && <Check className="absolute top-1 right-1 w-3 h-3 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {gender !== 'Female' ? (
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                        <Palette className="w-3 h-3" /> Facial Hair Forge
                      </Label>
                      <ScrollArea className="h-[350px] border rounded-xl bg-secondary/20 p-2">
                        <div className="grid grid-cols-2 gap-2">
                          {FACIAL_HAIR_STYLES.map(s => (
                            <button
                              key={s.name}
                              onClick={() => setFacialHair(s.name)}
                              className={cn(
                                "relative group flex flex-col items-center p-2 rounded-lg border-2 transition-all overflow-hidden",
                                facialHair === s.name 
                                  ? "border-primary bg-primary/10 shadow-md" 
                                  : "border-transparent bg-card/50 hover:border-primary/30"
                              )}
                            >
                                <div className="w-full aspect-square relative mb-2 rounded-md overflow-hidden bg-secondary/50">
                                    <img 
                                        src={s.imageUrl} 
                                        alt={s.name} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                                        data-ai-hint={`${s.name} facial hair`}
                                    />
                                </div>
                                <span className={cn("text-[10px] font-bold uppercase tracking-tight text-center truncate w-full", facialHair === s.name ? "text-primary" : "text-muted-foreground")}>
                                    {s.name}
                                </span>
                                {facialHair === s.name && <Check className="absolute top-1 right-1 w-3 h-3 text-primary" />}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border-2 border-dashed rounded-xl p-8 opacity-50 bg-secondary/10">
                      <div className="text-center">
                        <Dna className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs font-bold uppercase tracking-tighter">Features Balanced</p>
                        <p className="text-[10px] text-muted-foreground">Biological Origin: Female</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <GlassesIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">Optical Gear Interface</h3>
                  <p className="text-sm text-muted-foreground">Enhance your visual interface with high-fidelity eyewear presets.</p>
                </div>
                
                <ScrollArea className="h-[400px] border rounded-2xl bg-secondary/20 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {GLASSES_STYLES.map(s => (
                      <button
                        key={s.name}
                        onClick={() => setGlasses(s.name)}
                        className={cn(
                          "relative group flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                          glasses === s.name 
                            ? "border-primary bg-primary/10 shadow-xl" 
                            : "border-transparent bg-popover/50 hover:bg-accent hover:border-primary/30"
                        )}
                      >
                        <div className="w-full aspect-video relative mb-3 rounded-lg overflow-hidden bg-secondary/30 flex items-center justify-center">
                            <img 
                                src={s.imageUrl} 
                                alt={s.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                data-ai-hint={`${s.name} optical gear`}
                            />
                        </div>
                        <span className={cn("text-[10px] font-black text-center uppercase tracking-tighter leading-none px-1", glasses === s.name ? "text-primary" : "text-muted-foreground")}>
                            {s.name}
                        </span>
                        {glasses === s.name && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                    <ScanEye className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-2">Final Synthesis</h3>
                  <p className="text-sm text-muted-foreground">Review build parameters and generate your biological signature.</p>
                </div>
                
                {!avatarDataUri && !isProcessing && (
                  <div className="space-y-8 max-w-md mx-auto">
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: 'Stature', options: HEIGHTS, current: height, set: setHeight },
                        { label: 'Build', options: BODY_TYPES, current: bodyType, set: setBodyType },
                        { label: 'Age Range', options: AGE_RANGES, current: ageRange, set: setAgeRange }
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">{item.label}</Label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {item.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => item.set(opt)}
                                className={cn(
                                  "py-2 px-1 text-[10px] font-bold rounded-md border transition-all",
                                  item.current === opt 
                                    ? "bg-primary text-primary-foreground border-primary" 
                                    : "bg-secondary/50 border-transparent hover:bg-secondary"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleGenerate} 
                      className="w-full h-16 text-xl font-black uppercase tracking-tighter group hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all"
                    >
                      <Wand2 className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                      Forge Twinskie
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex flex-col items-center gap-6 py-10">
                    <div className="relative">
                      <Loader2 className="h-24 w-24 animate-spin text-primary opacity-20" />
                      <Sparkles className="absolute inset-0 h-24 w-24 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-black text-primary tracking-[0.2em] animate-pulse">SYNTHESIZING</p>
                      <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">Isolating biological data streams...</p>
                    </div>
                  </div>
                )}

                {avatarDataUri && (
                  <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
                      <div className="relative w-64 h-64 rounded-[2rem] bg-card border-2 border-primary/20 overflow-hidden shadow-2xl flex items-center justify-center">
                        <img src={avatarDataUri} alt="Preview" className="max-w-[90%] max-h-[90%] object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
                      </div>
                    </div>
                    <div className="flex gap-4 w-full max-w-sm">
                      <Button onClick={() => setAvatarDataUri(null)} variant="outline" size="lg" className="flex-1 font-bold border-2" disabled={isLoading}>
                        Re-calibrate
                      </Button>
                      <Button onClick={handleProceed} size="lg" className="flex-1 font-bold border-2 border-primary group shadow-lg shadow-primary/20" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Initialize
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
            
            {step < 5 && (
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
