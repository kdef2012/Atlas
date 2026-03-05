
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { findOrCreateSkill } from "@/ai/flows/find-or-create-skill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HeartPulse, ShieldAlert, Camera, X, CheckCircle2, Image as ImageIcon, Sparkles, Paperclip, Power } from "lucide-react";
import type { Skill, SkillCategory, Territory, Fireteam, User } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { useUser, useFirestore, useMemoFirebase, uploadProofOfWork, useCollection, useDoc, addDocumentNonBlocking } from "@/firebase";
import { collection, doc, increment, writeBatch } from "firebase/firestore";
import { haptics } from "@/lib/haptics";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  skill: z.string().min(3, "Please describe your activity."),
  proof: z.any().optional(),
});

const fitnessActivities = [
    "Ran 5.2 km",
    "Cycled for 45 minutes",
    "Completed a 30-minute HIIT workout",
    "Swam 1500 meters",
    "Lifted weights for 1 hour",
    "Walked 10,000 steps",
    "Did a 20-minute yoga session"
];

interface LogActivityFormProps {
  onSuccess?: () => void;
}

export function LogActivityForm({ onSuccess }: LogActivityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reliable stream assignment to prevent "grey box"
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  const startCamera = async () => {
    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (error) {
      console.warn('Camera access declined:', error);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this feature.'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData } = useDoc<User>(userRef);

  const fireteamRef = useMemoFirebase(() => userData?.fireteamId ? doc(firestore, 'fireteams', userData.fireteamId) : null, [firestore, userData]);
  const { data: fireteamData } = useDoc<Fireteam>(fireteamRef);
  
  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const territoriesCollectionRef = useMemoFirebase(() => collection(firestore, 'territories'), [firestore]);
  const publicLogsCollection = useMemoFirebase(() => collection(firestore, `public-logs`), [firestore]);

  const { data: allSkills } = useCollection<Skill>(skillsCollectionRef);
  const { data: allTerritories } = useCollection<Territory>(territoriesCollectionRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
    },
  });

  const handleSyncDevice = () => {
    setIsSyncing(true);
    haptics.light();
    const randomActivity = fitnessActivities[Math.floor(Math.random() * fitnessActivities.length)];
    
    setTimeout(() => {
        form.setValue('skill', randomActivity);
        toast({
            title: "Device Synced!",
            description: `Detected physical activity: "${randomActivity}"`
        });
        haptics.success();
        setIsSyncing(false);
    }, 1500);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return;
    
    const video = videoRef.current;
    // Check if video metadata is loaded and streaming
    if (video.videoWidth === 0) {
      toast({ description: "Initializing sensors... please try again in a moment." });
      return;
    }

    haptics.light();
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      setSelectedFileName("webcam_capture.png");
      form.setValue('proof', null);
      
      toast({
        title: "Signal Captured",
        description: "Visual proof locked into the buffer."
      });
      stopCamera();
    }
  };

  const clearCapturedImage = () => {
    setCapturedImage(null);
    setSelectedFileName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
      setCapturedImage(null);
      stopCamera();
    } else {
      setSelectedFileName(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !allSkills || !userRef || !userData || !publicLogsCollection) return;

    haptics.light();
    setIsLoading(true);
    try {
      const result = await findOrCreateSkill({ 
        activity: values.skill,
        existingSkills: allSkills,
      });
      
      let { skillId, isNewSkill, skillName, category, prerequisites, cost, isTrivial } = result;
      
      const hasFileInput = (values.proof && values.proof.length > 0);
      const hasCapturedPhoto = !!capturedImage;
      const hasProof = hasFileInput || hasCapturedPhoto;
      
      if (isNewSkill && !isTrivial && !hasProof) {
          toast({
              variant: "destructive",
              title: "Discovery Protocol Interrupted",
              description: "Pioneering a new discipline requires a visual signal (photo/video)."
          });
          haptics.error();
          setIsLoading(false);
          return;
      }

      const batch = writeBatch(firestore);
      const timestamp = Date.now();

      let xpGained = isNewSkill ? 150 : (isTrivial ? 50 : 100);
      
      if (isNewSkill && userData.traits?.pioneer) xpGained = Math.round(xpGained * 1.1);
      if (fireteamData?.streakActive) xpGained = Math.round(xpGained * 1.2);
      if (userData?.momentumFlameActive) xpGained = Math.round(xpGained * 1.5);

      let userStatUpdate: any = {
        lastLogTimestamp: timestamp,
        momentumFlameActive: true,
        [`${category.toLowerCase()}Stat`]: increment(isTrivial ? 2 : 10),
      };

      if (isNewSkill) {
        const newSkillDocRef = doc(skillsCollectionRef);
        skillId = newSkillDocRef.id;
        batch.set(newSkillDocRef, {
            id: skillId,
            name: skillName,
            description: `A new discipline discovered by ${userData.userName}.`,
            category: category,
            pioneerUserId: user.uid,
            xp: 0,
            prerequisites: prerequisites || [],
            cost: cost || { category: category, points: 20 },
            innovatorAwarded: false,
            isApproved: false,
        });

        const newGuildDocRef = doc(collection(firestore, 'guilds'));
        batch.set(newGuildDocRef, {
            name: `Guild of ${skillName}`,
            skillId: skillId,
            category: category,
            region: userData.region || 'Global',
            members: { [user.uid]: true },
            challengeGoal: 1000,
            challengeProgress: 0,
            challengeEndsAt: timestamp + (7 * 24 * 60 * 60 * 1000),
            isBuffActive: false,
        });
        
        if (!userData.traits?.pioneer) {
          userStatUpdate['traits.pioneer'] = true;
        }
      }
      
      let proofUrl = '';
      if (hasCapturedPhoto && capturedImage) {
        const blob = await (await fetch(capturedImage)).blob();
        const photoFile = new File([blob], "webcam_capture.png", { type: "image/png" });
        proofUrl = await uploadProofOfWork(user.uid, photoFile);
      } else if (hasFileInput && values.proof) {
        proofUrl = await uploadProofOfWork(user.uid, values.proof[0]);
      }

      const newLogRef = doc(collection(firestore, `users/${user.uid}/logs`));
      batch.set(newLogRef, {
        id: newLogRef.id,
        userId: user.uid,
        skillId: skillId,
        timestamp: timestamp,
        xp: xpGained,
        verificationPhotoUrl: proofUrl,
        isVerified: !hasProof,
      });

      addDocumentNonBlocking(publicLogsCollection, {
        skillName,
        category,
        userRegion: userData.region || 'Unknown Region',
        timestamp: timestamp,
      });

      userStatUpdate[`userSkills.${skillId}.xp`] = increment(xpGained);
      if (!hasProof) userStatUpdate.xp = increment(xpGained);

      if (userData.fireteamId && allTerritories) {
          const activeChallenge = allTerritories.find(t => t.faction === category && t.endsAt > timestamp);
          if (activeChallenge) {
              const territoryRef = doc(firestore, 'territories', activeChallenge.id);
              batch.update(territoryRef, { [`scores.${userData.fireteamId}`]: increment(xpGained) });
          }
      }
      
      const skillRef = doc(firestore, 'skills', skillId);
      batch.update(skillRef, { xp: increment(xpGained) });
      batch.update(userRef, userStatUpdate);
      
      await batch.commit();

      const Icon = (category && CATEGORY_ICONS[category as SkillCategory]) ? CATEGORY_ICONS[category as SkillCategory] : ShieldAlert;
      const iconColor = CATEGORY_COLORS[category as SkillCategory] || 'hsl(var(--primary))';

      haptics.success();
      toast({
        title: isNewSkill ? "Discovery Recorded" : "Activity Logged!",
        description: (
          <div className="flex items-center gap-2">
            <div style={{ color: iconColor }}>
              <Icon className="h-5 w-5" />
            </div>
            <span>
              {isNewSkill ? `Pioneered '${skillName}'!` : `Logged '${skillName}'.`}
              {hasProof ? " Awaiting verification." : ` (+${xpGained} XP)`}
            </span>
          </div>
        )
      });
      form.reset();
      setCapturedImage(null);
      setSelectedFileName(null);
      stopCamera();
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      haptics.error();
      toast({ 
        variant: "destructive", 
        title: "Logging Failed", 
        description: error.message || "Connectivity interference detected." 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="skill"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="What did you achieve?" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-black/40 aspect-video group">
            {capturedImage ? (
              <div className="relative w-full h-full animate-in fade-in zoom-in-95 duration-300">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="destructive" 
                  className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-lg"
                  onClick={clearCapturedImage}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-green-500/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Signal Locked
                </div>
              </div>
            ) : isCameraActive ? (
              <div className="relative w-full h-full">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  autoPlay 
                  muted 
                  playsInline 
                />
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 text-white hover:bg-white/10"
                  onClick={stopCamera}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Camera className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight">
                  Camera Sensor Offline<br/>Initialize to provide proof
                </p>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="mt-4 text-[10px] h-7 font-black uppercase tracking-widest"
                  onClick={startCamera}
                  disabled={isInitializing}
                >
                  {isInitializing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Power className="w-3 h-3 mr-1" />}
                  Initialize Camera
                </Button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              type="button" 
              variant={capturedImage ? "secondary" : "default"}
              className="font-bold h-11"
              onClick={capturePhoto}
              disabled={!isCameraActive || !!capturedImage || isLoading}
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture Signal
            </Button>

            <div className="relative">
              <Input 
                type="file" 
                className="pl-10 text-xs cursor-pointer opacity-0 absolute inset-0 z-10 h-full w-full" 
                accept="image/*,video/*"
                disabled={isLoading}
                onChange={(e) => {
                  handleFileChange(e);
                  form.setValue('proof', e.target.files);
                }}
              />
              <Button type="button" variant="outline" className="w-full font-bold h-11" disabled={isLoading}>
                <ImageIcon className="mr-2 h-4 w-4" />
                {selectedFileName ? 'Change File' : 'Attach File'}
              </Button>
            </div>
          </div>

          {selectedFileName && !capturedImage && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/10 px-3 py-2 rounded-lg animate-in slide-in-from-left-2">
              <div className="flex items-center gap-2 overflow-hidden text-primary">
                <Paperclip className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-bold truncate uppercase tracking-tighter">
                  {selectedFileName}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedFileName(null);
                  form.setValue('proof', null);
                }}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-primary/10">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleSyncDevice} 
              disabled={isSyncing || isLoading} 
              className="text-xs h-8 text-muted-foreground hover:bg-red-500/5"
            >
                {isSyncing ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <HeartPulse className="mr-2 h-3 w-3 text-red-500" />}
                Quick-Sync Heart Pulse
            </Button>
        </div>

        <Button type="submit" disabled={isLoading || !user} className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95">
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
          {isLoading ? "Transmitting..." : "Transmit Achievement"}
        </Button>
      </form>
    </Form>
  );
}
