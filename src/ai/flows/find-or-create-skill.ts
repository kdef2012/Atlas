'use server';

/**
 * @fileOverview This file contains a Genkit flow for finding an existing skill or creating a new one.
 * It uses an LLM to perform semantic search to avoid creating duplicate skills.
 *
 * It exports:
 * - `findOrCreateSkill` - The main function to find or create a skill.
 * - `FindOrCreateSkillInput` - The input type for the function.
 * - `FindOrCreateSkillOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Skill } from '@/lib/types';

// Define the input schema for the flow
const FindOrCreateSkillInputSchema = z.object({
  activity: z.string().describe('The user-provided description of the activity or skill.'),
  existingSkills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
  })).describe('A list of all skills that already exist in the database.'),
});
export type FindOrCreateSkillInput = z.infer<typeof FindOrCreateSkillInputSchema>;

// Define the output schema for the flow
const FindOrCreateSkillOutputSchema = z.object({
  isNewSkill: z.boolean().describe('Whether a new skill was created.'),
  skillId: z.string().describe('The ID of the found or newly created skill.'),
  skillName: z.string().describe('The normalized name of the skill.'),
  category: z
    .enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative'])
    .describe('The category of the skill.'),
});
export type FindOrCreateSkillOutput = z.infer<typeof FindOrCreateSkillOutputSchema>;


export async function findOrCreateSkill(
  input: FindOrCreateSkillInput
): Promise<FindOrCreateSkillOutput> {
  return findOrCreateSkillFlow(input);
}


const findOrCreateSkillPrompt = ai.definePrompt({
  name: 'findOrCreateSkillPrompt',
  input: {schema: FindOrCreateSkillInputSchema},
  output: {schema: FindOrCreateSkillOutputSchema},
  prompt: `You are an expert at categorizing and normalizing human activities into skills for a real-life RPG. Your goal is to determine if a user's logged activity corresponds to an existing skill or if it's a new one.

Analyze the user's activity: "{{{activity}}}"

Here is a list of existing skills:
{{#each existingSkills}}
- {{name}} (ID: {{id}}, Category: {{category}})
{{/each}}

Follow these rules:
1.  **Semantic Match:** Check if the user's activity is semantically equivalent to any existing skill. For example, "went for a run" is the same as "Running". "Learned to code" is the same as "Coding".
2.  **Determine Novelty:**
    *   If you find a semantic match, set \`isNewSkill\` to \`false\` and provide the \`skillId\`, \`skillName\`, and \`category\` of the EXISTING skill.
    *   If there is NO semantic match, it is a new skill. Set \`isNewSkill\` to \`true\`.
3.  **Normalize and Categorize New Skills:**
    *   If it is a new skill, create a concise, normalized name for it (e.g., "Rock Climbing", not "I went rock climbing"). Set this as \`skillName\`.
    *   Categorize this new skill into ONE of the following: Physical, Mental, Social, Practical, Creative. Set this as \`category\`.
    *   For new skills, set \`skillId\` to a placeholder string "NEW_SKILL".

Respond with ONLY the JSON object.`,
});

const findOrCreateSkillFlow = ai.defineFlow(
  {
    name: 'findOrCreateSkillFlow',
    inputSchema: FindOrCreateSkillInputSchema,
    outputSchema: FindOrCreateSkillOutputSchema,
  },
  async input => {
    const {output} = await findOrCreateSkillPrompt(input);
    return output!;
  }
);
