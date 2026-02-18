"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { findOrCreateSkill } from "@/ai/flows/find-or-create-skill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Paperclip, HeartPulse, Sparkles } from "lucide-react";
import type { Skill, SkillCategory, Territory, Fireteam, User, Guild, Trait } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { useUser, useFirestore, useMemoFirebase, uploadProofOfWork, useCollection, useDoc, addDocumentNonBlocking } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, increment, getDoc, writeBatch } from "firebase/firestore";

const formSchema = z.object({
  skill: z.string().min(3, "Please describe your activity."),
  proof: z.instanceof(FileList).optional(),
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

export function LogActivityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData } = useDoc<User>(userRef);

  const fireteamRef = useMemoFirebase(() => userData?.fireteamId ? doc(firestore, 'fireteams', userData.fireteamId) : null, [firestore, userData]);
  const { data: fireteamData } = useDoc<Fireteam>(fireteamRef);
  
  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const territoriesCollectionRef = useMemoFirebase(() => collection(firestore, 'territories'), [firestore]);
  const guildsCollectionRef = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
  const publicLogsCollection = useMemoFirebase(() => collection(firestore, `public-logs`), [firestore]);

  const { data: allSkills } = useCollection<Skill>(skillsCollectionRef);
  const { data: allTerritories } = useCollection<Territory>(territoriesCollectionRef);
  const { data: allGuilds } = useCollection<Guild>(guildsCollectionRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
    },
  });
  
  const fileRef = form.register("proof");

  const handleSyncDevice = () => {
    setIsSyncing(true);
    const randomActivity = fitnessActivities[Math.floor(Math.random() * fitnessActivities.length)];
    
    setTimeout(() => {
        form.setValue('skill', randomActivity);
        toast({
            title: "Device Synced!",
            description: `Synced activity: "${randomActivity}"`
        });
        setIsSyncing(false);
    }, 1500);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !allSkills || !userRef || !userData || !allGuilds || !publicLogsCollection) return;

    setIsLoading(true);
    try {
      const result = await findOrCreateSkill({ 
        activity: values.skill,
        existingSkills: allSkills,
      });
      
      let { skillId, isNewSkill, skillName, category, prerequisites, cost } = result;
      const hasProof = (values.proof && values.proof.length > 0);
      
      const batch = writeBatch(firestore);
      const timestamp = Date.now();

      // Base reward logic
      let xpGained = isNewSkill ? 150 : 100;
      if (isNewSkill && userData.traits?.pioneer) xpGained = Math.round(xpGained * 1.1);
      if (fireteamData?.streakActive) xpGained = Math.round(xpGained * 1.2);
      if (userData?.momentumFlameActive) xpGained = Math.round(xpGained * 1.5);

      let userStatUpdate: any = {
        lastLogTimestamp: timestamp,
        momentumFlameActive: true,
        // EVERY log grants energy points to its category, fueling the Nebula expansion
        [`${category.toLowerCase()}Stat`]: increment(10),
      };

      if (isNewSkill) {
        const newSkillDocRef = doc(skillsCollectionRef);
        skillId = newSkillDocRef.id;
        batch.set(newSkillDocRef, {
            id: skillId,
            name: skillName,
            description: `A new skill discovered by ${userData.userName}.`,
            category: category,
            pioneerUserId: user.uid,
            xp: 0,
            prerequisites: prerequisites || [],
            cost: cost || { category: category, points: 20 },
            innovatorAwarded: false,
        });

        const newGuildDocRef = doc(guildsCollectionRef);
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
      
      const isSkillUnlocked = userData.userSkills?.[skillId]?.isUnlocked;

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

      const Icon = CATEGORY_ICONS[category as SkillCategory] || Sparkles;
      const iconColor = CATEGORY_COLORS[category as SkillCategory];

      toast({
        title: isNewSkill ? "Pioneer Discovery!" : "Activity Logged!",
        description: (
          <div className="flex items-center gap-2">
            <div style={{ color: iconColor }}>
              <Icon className="h-5 w-5" />
            </div>
            <span>
              {isNewSkill ? `You've charted '${skillName}' in the Nebula!` : `Logged '${skillName}' in ${category}.`}
              {!hasProof ? ` (+${xpGained} XP / +10 ${category} Energy)` : ` Awaiting verification.`}
            </span>
          </div>
        )
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Logging Failed", description: "The Nebula was unable to record your feat." });
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
            render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                <FormControl>
                    <div className="relative">
                    <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="file" 
                      className="pl-10 text-xs" 
                      onChange={(e) => onChange(e.target.files)} 
                      {...field}
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
        <Button type="submit" disabled={isLoading || !user} className="w-full font-bold">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Log Achievement
        </Button>
      </form>
    </Form>
  );
}
