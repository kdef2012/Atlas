
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { findOrCreateSkill } from "@/ai/flows/find-or-create-skill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Paperclip, HeartPulse, ShieldAlert } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.warn('Camera access declined or unavailable:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
  }, []);

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
      const hasProof = (values.proof && values.proof.length > 0);
      
      if (isNewSkill && !isTrivial && !hasProof) {
          toast({
              variant: "destructive",
              title: "Discovery Protocol Interrupted",
              description: "Pioneering a new discipline in the Nebula requires a visual signal (photo/video) to prove its validity."
          });
          haptics.error();
          setIsLoading(false);
          return;
      }

      if (isNewSkill && isTrivial) {
          const genericSkill = allSkills.find(s => s.name === "Daily Rituals" || s.name === "Basic Maintenance");
          if (genericSkill) {
              isNewSkill = false;
              skillId = genericSkill.id;
              skillName = genericSkill.name;
          }
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
      if (hasProof && values.proof) {
        proofUrl = await uploadProofOfWork(user.uid, values.proof[0]);
      }

      const newLogRef = doc(collection(firestore, `users/${user.uid}/logs`));
      batch.set(newLogRef, {
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
              {isNewSkill ? `You've proposed '${skillName}' to the Nebula!` : `Logged '${skillName}' in ${category}.`}
              {isTrivial ? " (Maintenance task)" : ""}
              {!hasProof ? ` (+${xpGained} XP)` : ` Awaiting verification.`}
            </span>
          </div>
        )
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      haptics.error();
      toast({ variant: "destructive", title: "Logging Failed", description: "The Nebula was unable to record your feat. Check your connectivity." });
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
                <Input placeholder="What did you achieve? (e.g. 'Ran 5k', 'Drafted a pitch')" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-2">
            <FormField
            control={form.control}
            name="proof"
            render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                <FormControl>
                    <div className="relative">
                    <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="file" 
                      className="pl-10 text-xs" 
                      name={fieldProps.name}
                      onBlur={fieldProps.onBlur}
                      ref={fieldProps.ref}
                      onChange={(e) => {
                        onChange(e.target.files);
                      }} 
                    />
                    </div>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <Button type="button" variant="outline" onClick={handleSyncDevice} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HeartPulse className="mr-2 h-4 w-4 text-red-500" />}
                Sync Device
            </Button>
        </div>

        <div className="space-y-4">
            <video ref={videoRef} className="w-full aspect-video rounded-md bg-black/20 border-2 border-dashed border-primary/10" autoPlay muted playsInline />
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Sensor Signal Blocked</AlertTitle>
                    <AlertDescription>
                        Camera access is required for real-time verification. Enable permissions in your settings.
                    </AlertDescription>
                </Alert>
            )}
        </div>

        <div className="p-3 bg-secondary/30 rounded-lg border border-primary/10 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-tight">
                Pioneering a new skill requires visual proof. Trivial daily tasks are recorded but do not grant discovery rewards.
            </p>
        </div>
        <Button type="submit" disabled={isLoading || !user} className="w-full h-12 font-bold shadow-lg shadow-primary/20">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Transmit Achievement
        </Button>
      </form>
    </Form>
  );
}
