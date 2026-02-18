'use server';

/**
 * @fileOverview Defines a Genkit flow to analyze a user's activity and assign them personality traits.
 *
 * This flow acts as an AI Game Master, observing player behavior and rewarding them
 * with descriptive traits that reflect their playstyle.
 *
 * @interface AssignPersonalityTraitsInput - The input type for the function.
 * @interface AssignPersonalityTraitsOutput - The output type for the function.
 * @function assignPersonalityTraits - A function that analyzes user data and assigns traits.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const AssignPersonalityTraitsInputSchema = z.object({
  user: z.object({
      id: z.string(),
      traits: z.record(z.boolean()).optional().describe("The user's currently earned traits."),
      momentumFlameActive: z.boolean().describe("Whether the user's daily streak is active."),
      createdAt: z.number().describe("The timestamp when the user account was created."),
  }),
  logs: z.array(z.object({
      timestamp: z.number(),
      skillId: z.string(),
      category: z.string(),
  })).describe("A list of the user's recent activity logs, each with a category."),
  allTraits: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string(),
  })).describe("A list of all possible traits that can be assigned."),
});
export type AssignPersonalityTraitsInput = z.infer<typeof AssignPersonalityTraitsInputSchema>;

// Define the output schema for the flow
const AssignPersonalityTraitsOutputSchema = z.object({
  newlyAssignedTraits: z.array(z.string()).describe("An array of IDs for traits that the user has earned based on their activity."),
});
export type AssignPersonalityTraitsOutput = z.infer<typeof AssignPersonalityTraitsOutputSchema>;


export async function assignPersonalityTraits(
  input: AssignPersonalityTraitsInput
): Promise<AssignPersonalityTraitsOutput> {
  return assignPersonalityTraitsFlow(input);
}


const assignTraitsPrompt = ai.definePrompt({
  name: 'assignTraitsPrompt',
  model: 'googleai/gemini-1.5-flash', // Explicitly set to modern model to avoid 404 errors
  input: {schema: AssignPersonalityTraitsInputSchema},
  output: {schema: AssignPersonalityTraitsOutputSchema},
  prompt: `You are an AI Game Master for a real-life RPG called ATLAS. Your task is to analyze a user's activity logs and assign them personality traits.

You will be given the user's current profile (including existing traits), a list of their recent activity logs, and a list of all possible traits.

**User Profile:**
- Current Traits: {{#each user.traits}}{{@key}}, {{/each}}
- Daily Streak Active: {{{user.momentumFlameActive}}}

**User Activity Logs (past 30 days):**
{{#each logs}}
- Activity at {{timestamp}} in category: {{category}}
{{/each}}

**All Available Traits:**
{{#each allTraits}}
- **{{id}}**: {{description}}
{{/each}}

**Instructions:**
1.  Analyze the user's logs to identify behavioral patterns.
2.  Compare these patterns against the trait descriptions.
3.  You can assign multiple new traits if the user qualifies.
4.  **Crucially, only output the IDs of traits the user has newly earned and does NOT already possess.** If the user already has a trait, do not include it in your response.
5.  If no new traits have been earned, return an empty array.

**Behavioral Rules for Trait Assignment:**
- **night_owl**: A significant portion of logs are between 10 PM (22:00) and 6 AM (06:00) local time.
- **early_bird**: A significant portion of logs are between 5 AM (05:00) and 9 AM (09:00) local time.
- **focused**: The last 5 activities are all in the same skill category.
- **polymath**: The last 10 activities span at least 4 different skill categories.
- **streaker**: The user has an active daily streak ('momentumFlameActive' is true) and their account is older than 14 days.
- **socialite**: A high number of logs are in the 'Social' category.
- **hermit**: A high number of logs are in 'Mental' and 'Creative' categories, with very few 'Social' logs.

Based on your analysis, determine which new traits the user has earned. Respond with ONLY the JSON object containing the list of new trait IDs.`,
});

const assignPersonalityTraitsFlow = ai.defineFlow(
  {
    name: 'assignPersonalityTraitsFlow',
    inputSchema: AssignPersonalityTraitsInputSchema,
    outputSchema: AssignPersonalityTraitsOutputSchema,
  },
  async input => {
    const {output} = await assignTraitsPrompt(input);
    return output!;
  }
);
