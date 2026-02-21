'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a first quest for new users.
 *
 * The purpose is to provide an easy-to-achieve, auto-verifiable quest to create an immediate hook and encourage further engagement.
 *
 * @interface GenerateFirstQuestInput - The input type for the generateFirstQuest function.
 * @interface GenerateFirstQuestOutput - The output type for the generateFirstQuest function.
 * @function generateFirstQuest - A function that generates the first quest for a new user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFirstQuestInputSchema = z.object({
  userArchetype: z.string().describe('The archetype chosen by the user during onboarding (e.g., Titan, Sage, Maverick).'),
});
export type GenerateFirstQuestInput = z.infer<typeof GenerateFirstQuestInputSchema>;

const GenerateFirstQuestOutputSchema = z.object({
  questName: z.string().describe('The name of the first quest.'),
  questDescription: z.string().describe('A description of the first quest, which should be easy to achieve and auto-verify.'),
});
export type GenerateFirstQuestOutput = z.infer<typeof GenerateFirstQuestOutputSchema>;

export async function generateFirstQuest(input: GenerateFirstQuestInput): Promise<GenerateFirstQuestOutput> {
  return generateFirstQuestFlow(input);
}

const firstQuestPrompt = ai.definePrompt({
  name: 'firstQuestPrompt',
  input: {schema: GenerateFirstQuestInputSchema},
  output: {schema: GenerateFirstQuestOutputSchema},
  prompt: `You are an expert in user onboarding and gamification. Your goal is to suggest an initial quest for a new user of the ATLAS app, an RPG that gamifies real life.

The quest must be extremely easy to achieve and should be automatically verifiable to provide an immediate sense of accomplishment and encourage continued engagement.

The user has selected the following archetype: {{{userArchetype}}}.

Suggest a quest that is appropriate for this user.

Consider these examples of very easy, auto-verifiable quests:
* Drink Water
* Stretch for 5 Minutes
* Take a Deep Breath
* Stand up and Walk Around

Ensure that the quest aligns with the user's selected archetype to create a personalized experience.

Respond with a quest name and quest description.`,
});

const generateFirstQuestFlow = ai.defineFlow(
  {
    name: 'generateFirstQuestFlow',
    inputSchema: GenerateFirstQuestInputSchema,
    outputSchema: GenerateFirstQuestOutputSchema,
  },
  async input => {
    const {output} = await firstQuestPrompt(input);
    return output!;
  }
);
