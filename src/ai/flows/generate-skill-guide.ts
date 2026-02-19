
'use server';

/**
 * @fileOverview Defines a Genkit flow to generate an "ATLAS Guide" for newly pioneered skills.
 * This acts as the Nebula's Librarian, creating educational content for the Rolodex.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSkillGuideInputSchema = z.object({
  skillName: z.string().describe('The name of the skill.'),
  category: z.string().describe('The category of the skill (Physical, Mental, etc).'),
  description: z.string().describe('A brief description of the skill provided by the pioneer.'),
});
export type GenerateSkillGuideInput = z.infer<typeof GenerateSkillGuideInputSchema>;

const GenerateSkillGuideOutputSchema = z.object({
  guideMarkdown: z.string().describe('The full guide formatted in Markdown.'),
});
export type GenerateSkillGuideOutput = z.infer<typeof GenerateSkillGuideOutputSchema>;

export async function generateSkillGuide(
  input: GenerateSkillGuideInput
): Promise<GenerateSkillGuideOutput> {
  return generateSkillGuideFlow(input);
}

const skillGuidePrompt = ai.definePrompt({
  name: 'skillGuidePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateSkillGuideInputSchema },
  output: { schema: GenerateSkillGuideOutputSchema },
  prompt: `You are the "Head Librarian of the ATLAS Nebula." A new discipline has been pioneered by a citizen: "{{{skillName}}}" (Category: {{{category}}}).

Your task is to write an official "Initiate's Guide" for this skill to be added to the Nebula Rolodex. The guide should be professional, futuristic, and highly encouraging.

**Tone:** Wise, helpful, and inspiring. Use terminology like "Signal," "Nebula," "Calibration," and "Mastery."

**Structure:**
1.  **# Overview:** Define the essence of this skill and why it matters in the evolution of a citizen.
2.  **## The Initiate's Path (First Steps):** Provide 3-4 concrete, simple steps a beginner can take to start practicing this today.
3.  **## Calibration & Gear:** What mindset or physical tools (if any) are required to properly manifest this skill's signal?
4.  **## Mastery Milestones:** Describe what "Advanced Mastery" looks like for this specific skill.

**Markdown Requirements:**
- Use # for the main title.
- Use ## for sections.
- Use bullet points for lists.
- Be concise but thorough.

Citizen Description of Discovery: {{{description}}}

Now, author the guide.`,
});

const generateSkillGuideFlow = ai.defineFlow(
  {
    name: 'generateSkillGuideFlow',
    inputSchema: GenerateSkillGuideInputSchema,
    outputSchema: GenerateSkillGuideOutputSchema,
  },
  async (input) => {
    const { output } = await skillGuidePrompt(input);
    if (!output) throw new Error('Failed to generate skill guide.');
    return output;
  }
);
