

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
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Paperclip, HeartPulse } from "lucide-react";
import type { Skill, SkillCategory, Territory, Fireteam, User, Guild } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { useUser, useFirestore, useMemoFirebase, uploadProofOfWork, useCollection, useDoc } from "@/firebase";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, increment, getDoc, writeBatch } from "firebase/firestore";

const formSchema = z.object({
  skill: z.string().min(3, "Please describe your activity."),
  proof: z.instanceof(FileList).optional(),
});

// Trait thresholds
const INNOVATOR_THRESHOLD = 1000;
const SPECIALIST_THRESHOLD = 500;
const JACK_OF_ALL_TRADES_THRESHOLD = 150;
const JACK_OF_ALL_TRADES_RANGE = 50;

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
  
  const guildRef = useMemoFirebase(() => userData?.guildId ? doc(firestore, 'guilds', userData.guildId) : null, [firestore, userData]);
  const { data: guildData } = useDoc<Guild>(guildRef);

  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const territoriesCollectionRef = useMemoFirebase(() => collection(firestore, 'territories'), [firestore]);
  const userLogsCollection = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/logs`) : null, [firestore, user]);

  const { data: allSkills } = useCollection<Skill>(skillsCollectionRef);
  const { data: allTerritories } = useCollection<Territory>(territoriesCollectionRef);

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
    if (!user || !userLogsCollection || !allSkills || !userRef || !userData) return;

    setIsLoading(true);
    try {
      // Step 1: Call the AI flow to find or create the skill
      const result = await findOrCreateSkill({ 
        activity: values.skill,
        existingSkills: allSkills,
      });
      
      let { skillId, isNewSkill, skillName, category, prerequisites, cost } = result;
      const hasProof = values.proof && values.proof.length > 0;
      
      const batch = writeBatch(firestore);
      let userStatUpdate: any = {
        [`${category.toLowerCase()}Stat`]: increment(10),
        lastLogTimestamp: Date.now(),
        momentumFlameActive: true,
      };

      // Step 2: If it's a new skill, create it in Firestore and grant Pioneer trait
      if (isNewSkill) {
        const newSkillDocRef = doc(skillsCollectionRef); // Create a reference with a new ID
        batch.set(newSkillDocRef, {
            name: skillName,
            description: `A new skill discovered by a Pioneer.`,
            category: category,
            pioneerUserId: user.uid,
            xp: 0,
            prerequisites: prerequisites || [],
            cost: cost || { category: category, points: 10 },
            innovatorAwarded: false,
        });
        skillId = newSkillDocRef.id;
        
        // Grant Pioneer Trait
        if (!userData.traits?.pioneer) {
          userStatUpdate['traits.pioneer'] = true;
          toast({ title: "Trait Unlocked: Pioneer!", description: "You've discovered a new skill and expanded the ATLAS!" });
        }
      }
      
      let xpGained = isNewSkill ? 150 : 100; // Bonus XP for pioneers

      // Apply Soul Link bonus if active
      if (fireteamData?.streakActive) {
        xpGained = Math.round(xpGained * 1.2);
      }
      
      // Apply Momentum Flame bonus if active
      if (userData?.momentumFlameActive) {
        xpGained = Math.round(xpGained * 1.5);
      }

      // Apply Guild buff if active
      if (guildData?.isBuffActive) {
        xpGained = Math.round(xpGained * 1.25);
      }
      
      const skillRef = doc(firestore, 'skills', skillId);
      // Step 3: Handle file upload if proof is provided
      let proofUrl = '';
      if (hasProof) {
        const file = values.proof[0];
        try {
          proofUrl = await uploadProofOfWork(user.uid, file);
        } catch (uploadError) {
           console.error("Failed to upload proof:", uploadError);
           toast({
              variant: "destructive",
              title: "Upload Failed",
              description: "Could not upload your proof file. Please try again.",
           });
           setIsLoading(false);
           return;
        }
      }

      // Step 4: Create a log entry
      const newLogRef = doc(userLogsCollection); // Create a reference with a new ID
      batch.set(newLogRef, {
        userId: user.uid,
        skillId: skillId,
        timestamp: Date.now(),
        xp: xpGained,
        verificationPhotoUrl: proofUrl,
        isVerified: !hasProof,
      });

      // Step 5: Update user stats
      userStatUpdate[`userSkills.${skillId}.xp`] = increment(xpGained);
      if (!hasProof) {
        userStatUpdate.xp = increment(xpGained);
      }
      
      // Step 6: Update Faction Challenge score
      if (userData.fireteamId && allTerritories) {
          const now = Date.now();
          const activeChallenge = allTerritories.find(t => t.faction === category && t.endsAt > now);

          if (activeChallenge) {
              const territoryRef = doc(firestore, 'territories', activeChallenge.id);
              batch.update(territoryRef, { [`scores.${userData.fireteamId}`]: increment(xpGained) });
          }
      }
       // Step 6.5: Update Guild Challenge score
      if (guildRef && guildData && guildData.challengeEndsAt > Date.now()) {
          batch.update(guildRef, { challengeProgress: increment(xpGained) });
      }
      
      // Step 7: Check for and award new traits
      const currentStats = {
          physical: userData.physicalStat,
          mental: userData.mentalStat,
          social: userData.socialStat,
          practical: userData.practicalStat,
          creative: userData.creativeStat,
      };
      
      // Specialist Trait
      const categoryStatName = `${category.toLowerCase()}Stat` as keyof typeof currentStats;
      const newCategoryValue = (currentStats[categoryStatName] || 0) + 10;
      if (newCategoryValue >= SPECIALIST_THRESHOLD && !userData.traits?.specialist) {
          userStatUpdate['traits.specialist'] = true;
          toast({ title: "Trait Unlocked: Specialist!", description: `You've shown deep focus in the ${category} category.` });
      }

      // Jack of All Trades Trait
      const statsValues = Object.values(currentStats);
      const minStat = Math.min(...statsValues);
      const maxStat = Math.max(...statsValues);
      if (minStat >= JACK_OF_ALL_TRADES_THRESHOLD && (maxStat - minStat) <= JACK_OF_ALL_TRADES_RANGE && !userData.traits?.jack_of_all_trades) {
          userStatUpdate['traits.jack_of_all_trades'] = true;
          toast({ title: "Trait Unlocked: Jack of All Trades!", description: "Your balanced approach to life is admirable." });
      }
      
      batch.update(userRef, userStatUpdate);
      
      // Innovator Trait check (must happen after batch commits user stat updates)
      const skillDoc = await getDoc(skillRef);
      if (skillDoc.exists()) {
        const skillData = skillDoc.data() as Skill;
        const newSkillXp = (skillData.xp || 0) + xpGained;
        
        if (skillData.pioneerUserId && !skillData.innovatorAwarded && newSkillXp >= INNOVATOR_THRESHOLD) {
            const pioneerRef = doc(firestore, 'users', skillData.pioneerUserId);
            updateDocumentNonBlocking(pioneerRef, { 'traits.innovator': true });
            updateDocumentNonBlocking(skillRef, { innovatorAwarded: true });
            
            // Check if we need to notify the pioneer
            const pioneerDoc = await getDoc(pioneerRef);
            if (pioneerDoc.exists() && pioneerDoc.data().id !== user.uid) { // Don't notify if you are the pioneer
              toast({ title: `Your skill '${skillData.name}' became popular!`, description: `User ${pioneerDoc.data().userName} has been awarded the Innovator trait.` });
            } else if (pioneerDoc.exists() && pioneerDoc.data().id === user.uid) {
                toast({ title: "Trait Unlocked: Innovator!", description: `Your skill '${skillData.name}' has become a cornerstone of the ATLAS!` });
            }
        }
      }
      
      // Always increment the total XP on the skill itself.
      updateDocumentNonBlocking(skillRef, { xp: increment(xpGained) });
      
      await batch.commit();


      // Step 8: Show feedback toast
      const Icon = CATEGORY_ICONS[category as SkillCategory];
      let toastDescription = `Your '${skillName}' activity was logged as <strong>${category}</strong>.`;
      if (!hasProof) {
         toastDescription += ` (+${xpGained} XP)`;
      } else {
         toastDescription += ` Awaiting verification for ${xpGained} XP.`;
      }
      if (isNewSkill) {
          toastDescription += `<br><strong>Pioneer Bonus!</strong> You discovered a new skill!`;
      }

      toast({
        title: "Activity Logged!",
        description: (
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: CATEGORY_COLORS[category as SkillCategory] }}/>
            <span dangerouslySetInnerHTML={{ __html: toastDescription }} />
          </div>
        )
      });
      form.reset();
    } catch (error) {
      console.error("Failed to log activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not log your activity. Please try again.",
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
                <Input placeholder="e.g., 'Ran 5k' or 'Learned React'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-2">
            <FormField
            control={form.control}
            name="proof"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="sr-only">Proof of Work</FormLabel>
                <FormControl>
                    <div className="relative">
                    <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="file" className="pl-10" {...fileRef} />
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
        <Button type="submit" disabled={isLoading || !user || !allSkills} className="w-full font-bold">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Log XP
        </Button>
      </form>
    </Form>
  );
}

    