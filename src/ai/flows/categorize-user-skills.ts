
'use server';

/**
 * @fileOverview This file contains the Genkit flow for categorizing user skills based on their input.
 *
 * It exports:
 * - `categorizeUserSkill` - The main function to categorize a user's skill.
 * - `CategorizeUserSkillInput` - The input type for the categorizeUserSkill function.
 * - `CategorizeUserSkillOutput` - The output type for the categorizeUserSkill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeUserSkillInputSchema = z.object({
  skill: z.string().describe('The user-defined skill or activity.'),
});
export type CategorizeUserSkillInput = z.infer<typeof CategorizeUserSkillInputSchema>;

const CategorizeUserSkillOutputSchema = z.object({
  category: z
    .enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative'])
    .describe('The category of the skill.'),
});
export type CategorizeUserSkillOutput = z.infer<typeof CategorizeUserSkillOutputSchema>;

/**
 * @deprecated This flow is deprecated in favor of the more comprehensive findOrCreateSkill flow.
 */
export async function categorizeUserSkill(
  input: CategorizeUserSkillInput
): Promise<CategorizeUserSkillOutput> {
  return categorizeUserSkillFlow(input);
}

const categorizeUserSkillPrompt = ai.definePrompt({
  name: 'categorizeUserSkillPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: CategorizeUserSkillInputSchema},
  output: {schema: CategorizeUserSkillOutputSchema},
  prompt: `Categorize the following user-defined skill into one of the following categories: Physical, Mental, Social, Practical, or Creative.\n\nSkill: {{{skill}}}\nCategory:`,
});

const categorizeUserSkillFlow = ai.defineFlow(
  {
    name: 'categorizeUserSkillFlow',
    inputSchema: CategorizeUserSkillInputSchema,
    outputSchema: CategorizeUserSkillOutputSchema,
  },
  async input => {
    const {output} = await categorizeUserSkillPrompt(input);
    return output!;
  }
);
