
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
import { Loader2, Paperclip } from "lucide-react";
import type { Skill, SkillCategory } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { useUser, useFirestore, useMemoFirebase, uploadProofOfWork, useCollection } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, increment } from "firebase/firestore";
import type { Log } from "@/lib/log";

const formSchema = z.object({
  skill: z.string().min(3, "Please describe your activity."),
  proof: z.instanceof(FileList).optional(),
});

export function LogActivityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const userLogsCollection = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/logs`) : null, [firestore, user]);

  const { data: allSkills } = useCollection<Skill>(skillsCollectionRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
    },
  });
  
  const fileRef = form.register("proof");


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userLogsCollection || !allSkills) return;

    setIsLoading(true);
    try {
      // Step 1: Call the AI flow to find or create the skill
      const result = await findOrCreateSkill({ 
        activity: values.skill,
        existingSkills: allSkills,
      });
      
      let { skillId, isNewSkill, skillName, category } = result;

      // Step 2: If it's a new skill, create it in Firestore
      if (isNewSkill) {
        const newSkillDoc = await addDocumentNonBlocking(skillsCollectionRef, {
          name: skillName,
          category: category,
          pioneerUserId: user.uid,
          xp: 10, // Initial XP for a new skill
        });
        if (newSkillDoc) {
            skillId = newSkillDoc.id; // Get the actual ID of the newly created skill
        } else {
            throw new Error("Failed to create new skill document.");
        }
      }
      
      const xpGained = isNewSkill ? 150 : 100; // Bonus XP for pioneers

      // Always increment the total XP on the skill itself
      if (skillId) {
        const skillRef = doc(firestore, 'skills', skillId);
        updateDocumentNonBlocking(skillRef, { xp: increment(10) });
      }
      
      // Step 3: Handle file upload if proof is provided
      let proofUrl = '';
      if (values.proof && values.proof.length > 0) {
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
      const newLog: Omit<Log, 'id'> = {
        userId: user.uid,
        skillId: skillId,
        timestamp: Date.now(),
        xp: xpGained,
        verificationPhotoUrl: proofUrl,
      };
      addDocumentNonBlocking(userLogsCollection, newLog);

      // Step 5: Update user stats
      const userRef = doc(firestore, 'users', user.uid);
      const statUpdate = {
        xp: increment(xpGained),
        [`${category.toLowerCase()}Stat`]: increment(10),
        lastLogTimestamp: Date.now(),
      };
      updateDocumentNonBlocking(userRef, statUpdate);

      // Step 6: Show feedback toast
      const Icon = CATEGORY_ICONS[category as SkillCategory];
      toast({
        title: "Activity Logged!",
        description: (
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: CATEGORY_COLORS[category as SkillCategory] }}/>
            <span>Your '{skillName}' activity was logged as <strong>{category}</strong>. {isNewSkill && "You're a Pioneer!"} (+{xpGained} XP)</span>
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
        <Button type="submit" disabled={isLoading || !user || !allSkills} className="w-full font-bold">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Log XP
        </Button>
      </form>
    </Form>
  );
}
