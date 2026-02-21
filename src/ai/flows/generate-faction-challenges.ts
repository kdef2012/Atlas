'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a new set of weekly Faction Challenges.
 *
 * This acts as an AI Game Master, creating a fresh set of competitive challenges
 * for each of the five skill categories (Factions).
 *
 * @interface GenerateFactionChallengesOutput - The output type for the generateFactionChallenges function.
 * @function generateFactionChallenges - A function that generates a new set of challenges.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for each individual challenge in the output
const ChallengeSchema = z.object({
  faction: z
    .enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative'])
    .describe('The skill category (Faction) this challenge is for.'),
  challengeDescription: z.string().describe("A creative, engaging description for the challenge (e.g., 'Log the most miles run' or 'Complete the most coding tutorials')."),
});

// Define the output schema for the flow
const GenerateFactionChallengesOutputSchema = z.object({
  challenges: z.array(ChallengeSchema).length(5).describe('An array of exactly 5 generated challenges, one for each Faction.'),
});
export type GenerateFactionChallengesOutput = z.infer<typeof GenerateFactionChallengesOutputSchema>;

// Exported function that other parts of the application can call
export async function generateFactionChallenges(): Promise<GenerateFactionChallengesOutput> {
  const result = await generateFactionChallengesFlow();

  // The AI generates the content, but we'll set the end date here for consistency.
  const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
  
  const challengesWithDates = result.challenges.map(challenge => ({
      ...challenge,
      endsAt: sevenDaysFromNow,
      scores: {}, // Initialize with empty scores
  }));

  return { challenges: challengesWithDates as any[] };
}


// Define the prompt for the AI model
const generateChallengesPrompt = ai.definePrompt({
  name: 'generateChallengesPrompt',
  output: {schema: GenerateFactionChallengesOutputSchema},
  prompt: `You are the Game Master for a real-life RPG called ATLAS. Your task is to create a new set of 5 weekly "Faction Challenges".

Each challenge is tied to one of the five core skill Factions: Physical, Mental, Social, Practical, and Creative.

**Guidelines:**
1.  Generate exactly FIVE unique challenges, one for each Faction.
2.  The 'challengeDescription' should be a clear, measurable goal that users can contribute to by logging activities.
3.  Be creative and thematic! The descriptions should be engaging and fit the tone of a futuristic RPG. Avoid generic goals like "log the most XP". Focus on specific, fun activities.

Now, generate a new set of five Faction Challenges.`,
});

// Define the Genkit flow
const generateFactionChallengesFlow = ai.defineFlow(
  {
    name: 'generateFactionChallengesFlow',
    outputSchema: GenerateFactionChallengesOutputSchema,
  },
  async () => {
    const {output} = await generateChallengesPrompt();
    return output!;
  }
);
