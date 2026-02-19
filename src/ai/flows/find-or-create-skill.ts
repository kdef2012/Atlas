
'use server';

/**
 * @fileOverview This file contains a Genkit flow for finding an existing skill or creating a new one.
 * It uses an LLM to perform semantic search, determine prerequisites, and set a cost for new skills.
 * Enhanced with a complexity floor to prevent trivial activity farming.
 *
 * It exports:
 * - `findOrCreateSkill` - The main function to find or create a skill.
 * - `FindOrCreateSkillInput` - The input type for the function.
 * - `FindOrCreateSkillOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const SkillCostSchema = z.object({
    category: z.enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative']).describe('The category of points required to unlock.'),
    points: z.number().describe('The number of points required.'),
});

// Define the output schema for the flow
const FindOrCreateSkillOutputSchema = z.object({
  isNewSkill: z.boolean().describe('Whether a new skill was created.'),
  isTrivial: z.boolean().describe('Whether the activity is a low-effort, basic human function (e.g. drinking water, walking to fridge).'),
  skillId: z.string().describe('The ID of the found or newly created skill.'),
  skillName: z.string().describe('The normalized name of the skill.'),
  category: z
    .enum(['Physical', 'Mental', 'Social', 'Practical', 'Creative'])
    .describe('The category of the skill.'),
  prerequisites: z.array(z.string()).optional().describe('An array of skill IDs that are prerequisites for this new skill.'),
  cost: SkillCostSchema.optional().describe('The cost to unlock the new skill.'),
});
export type FindOrCreateSkillOutput = z.infer<typeof FindOrCreateSkillOutputSchema>;


export async function findOrCreateSkill(
  input: FindOrCreateSkillInput
): Promise<FindOrCreateSkillOutput> {
  return findOrCreateSkillFlow(input);
}


const findOrCreateSkillPrompt = ai.definePrompt({
  name: 'findOrCreateSkillPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: FindOrCreateSkillInputSchema},
  output: {schema: FindOrCreateSkillOutputSchema},
  prompt: `You are an expert at categorizing and normalizing human activities into skills for a real-life RPG. Your goal is to determine if a user's logged activity corresponds to an existing skill, a new "Pioneer" skill, or if it's a trivial daily maintenance task.

Analyze the user's activity: "{{{activity}}}"

Here is a list of existing skills:
{{#each existingSkills}}
- {{name}} (ID: {{id}}, Category: {{category}})
{{/each}}

Follow these rules:
1.  **Complexity Check (CRITICAL):**
    *   Determine if the activity is a **basic human function** or a low-effort daily task (e.g., "drinking water", "waking up", "brushing teeth", "walking to the car", "breathing").
    *   If it is a basic task, set \`isTrivial\` to \`true\`. These should ALMOST NEVER be new skills. If it is trivial and matches an existing skill like "Hydration" or "Basic Movement", map it there. If it doesn't match, map it to a generic skill "Daily Rituals".
    *   If it represents a distinct **craft, discipline, or measurable effort** (e.g., "Archery", "Coding", "Marathon Training", "Oil Painting"), set \`isTrivial\` to \`false\`.

2.  **Semantic Match:**
    *   First, check if the activity is semantically equivalent to any existing skill.
    *   If a match exists, set \`isNewSkill\` to \`false\` and provide the existing details.

3.  **Determine Novelty:**
    *   If there is NO semantic match AND it is NOT trivial, it is a new Pioneer skill. Set \`isNewSkill\` to \`true\` and \`isTrivial\` to \`false\`.

4.  **Define New Skills (if isNewSkill is true):**
    *   **Name:** Create a concise, normalized name (e.g., "Kintsugi Pottery").
    *   **Category:** Physical, Mental, Social, Practical, Creative.
    *   **Prerequisites:** Identify logical existing skills.
    *   **Cost:** Based on difficulty (10-100 points).
    *   **ID:** Set to "NEW_SKILL".

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
