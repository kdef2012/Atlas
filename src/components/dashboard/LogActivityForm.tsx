"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categorizeUserSkill } from "@/ai/flows/categorize-user-skills";
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
import type { SkillCategory, User } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/types";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, query, where, getDocs } from "firebase/firestore";

const formSchema = z.object({
  skill: z.string().min(3, "Please describe your activity."),
  proof: z.any().optional(), // Allow any file type
});

export function LogActivityForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const skillsCollection = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const userLogsCollection = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/logs`) : null, [firestore, user]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userLogsCollection) return;

    setIsLoading(true);
    try {
      // Step 1: Categorize the skill
      const result = await categorizeUserSkill({ skill: values.skill });
      const category = result.category as SkillCategory;
      const Icon = CATEGORY_ICONS[category];

      let skillId = '';
      let isPioneer = false;

      // Step 2: Check if skill exists
      const skillQuery = query(skillsCollection, where("name", "==", values.skill));
      const skillSnapshot = await getDocs(skillQuery);

      if (skillSnapshot.empty) {
        // Skill doesn't exist, create it
        isPioneer = true;
        const newSkillDoc = await addDocumentNonBlocking(skillsCollection, {
          name: values.skill,
          category: category,
          pioneerUserId: user.uid,
          xp: 100, // Initial XP for new skill
        });
        skillId = newSkillDoc?.id || '';
      } else {
        // Skill exists
        const existingSkill = skillSnapshot.docs[0];
        skillId = existingSkill.id;
        // Optionally update XP on existing skill
        const skillRef = doc(firestore, 'skills', skillId);
        updateDocumentNonBlocking(skillRef, { xp: (existingSkill.data().xp || 0) + 100 });
      }
      
      // Step 3: Create a log entry
      const xpGained = isPioneer ? 150 : 100; // Bonus XP for pioneers
      await addDocumentNonBlocking(userLogsCollection, {
        userId: user.uid,
        skillId: skillId,
        timestamp: Date.now(),
        xp: xpGained,
        // verificationPhotoUrl will be handled later
      });

      // Step 4: Update user stats
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = (await getDocs(query(collection(firestore, 'users'), where("id", "==", user.uid)))).docs[0];
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        const newXP = (userData.xp || 0) + xpGained;
        const newLevel = Math.floor(newXP / 1000); // Simple level up logic
        
        updateDocumentNonBlocking(userRef, {
            xp: newXP,
            level: newLevel,
            [`${category.toLowerCase()}Stat`]: (userData[`${category.toLowerCase()}Stat` as keyof User] as number || 0) + 10,
            lastLogTimestamp: Date.now(),
        });
      }


      toast({
        title: "Activity Logged!",
        description: (
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" style={{ color: CATEGORY_COLORS[category] }}/>
            <span>Your activity was categorized as <strong>{category}</strong>. {isPioneer && "You're a Pioneer!"} (+{xpGained} XP)</span>
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
                   <Input type="file" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading || !user} className="w-full font-bold">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Log XP
        </Button>
      </form>
    </Form>
  );
}
