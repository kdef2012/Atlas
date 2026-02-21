'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a set of personalized quests for a user.
 *
 * This acts as an AI Dungeon Master, creating quests based on the user's archetype,
 * level, and stats to ensure they are relevant and engaging.
 *
 * @interface GenerateQuestsInput - The input type for the generateQuests function.
 * @interface GenerateQuestsOutput - The output type for the generateQuests function.
 * @function generateQuests - A function that generates quests for a user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for each individual quest object in the output
const QuestSchema = z.object({
  name: z.string().describe('A short, engaging name for the quest.'),
  description: z.string().describe('A one-sentence description of the task.'),
  category: z
    .enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative'])
    .describe('The skill category this quest falls into.'),
});

// Define the input schema for the flow
const GenerateQuestsInputSchema = z.object({
  archetype: z.string().describe("The user's chosen archetype (e.g., Titan, Sage, Maverick)."),
  level: z.number().describe('The current level of the user.'),
  stats: z.object({
    physical: z.number(),
    mental: z.number(),
    social: z.number(),
    practical: z.number(),
    creative: z.number(),
  }).describe("The user's current skill statistics."),
});
export type GenerateQuestsInput = z.infer<typeof GenerateQuestsInputSchema>;

// Define the output schema for the flow, which is an array of quests
const GenerateQuestsOutputSchema = z.object({
  quests: z.array(QuestSchema).length(3).describe('An array of exactly 3 generated quests.'),
});
export type GenerateQuestsOutput = z.infer<typeof GenerateQuestsOutputSchema>;

// Exported function that other parts of the application can call
export async function generateQuests(input: GenerateQuestsInput): Promise<GenerateQuestsOutput> {
  return generateQuestsFlow(input);
}


// Define the prompt for the AI model
const generateQuestsPrompt = ai.definePrompt({
  name: 'generateQuestsPrompt',
  input: {schema: GenerateQuestsInputSchema},
  output: {schema: GenerateQuestsOutputSchema},
  prompt: `You are a creative Dungeon Master for a real-life RPG called ATLAS. Your job is to generate a list of three engaging and challenging quests for a user.

The quests should be personalized based on the user's profile. They should encourage the user to step out of their comfort zone but be achievable within a day or two.

**User Profile:**
- **Archetype:** {{{archetype}}}
- **Level:** {{{level}}}
- **Stats:**
  - Physical: {{{stats.physical}}}
  - Mental: {{{stats.mental}}}
  - Social: {{{stats.social}}}
  - Practical: {{{stats.practical}}}
  - Creative: {{{stats.creative}}}

**Quest Generation Guidelines:**
1.  Generate exactly THREE unique quests.
2.  The quests should be diverse. Try to target different skill categories.
3.  Tailor the quests to the user's **archetype**. A Titan should get more physical quests, a Sage more mental, and a Maverick more creative/social ones.
4.  Consider the user's stats. If a stat is low, suggest a simple introductory quest for that category. If a stat is high, suggest a more challenging quest.
5.  The quest 'name' should be catchy and short.
6.  The 'description' should be a clear, single-sentence call to action.
7.  The 'category' must be one of the five valid skill categories.

Now, generate a new set of three quests for the provided user profile.`,
});

// Define the Genkit flow
const generateQuestsFlow = ai.defineFlow(
  {
    name: 'generateQuestsFlow',
    inputSchema: GenerateQuestsInputSchema,
    outputSchema: GenerateQuestsOutputSchema,
  },
  async input => {
    const {output} = await generateQuestsPrompt(input);
    return output!;
  }
);
