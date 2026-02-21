'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a professional resume for a user
 * based on their in-app activities, skills, and achievements.
 *
 * @interface GenerateResumeInput - The input type for the function.
 * @interface GenerateResumeOutput - The output type for the function.
 * @function generateResume - A function that generates a resume in Markdown format.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateResumeInputSchema = z.object({
  userName: z.string().describe("The user's full name."),
  archetype: z.string().describe("The user's primary archetype (e.g., Titan, Sage, Maverick)."),
  level: z.number().describe("The user's current level."),
  skills: z.array(z.object({
    name: z.string(),
    category: z.string(),
    xp: z.number(),
  })).describe("A list of skills the user has practiced, including XP earned."),
  traits: z.array(z.string()).describe("A list of personality traits the user has earned."),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

// Define the output schema for the flow
const GenerateResumeOutputSchema = z.object({
  markdownContent: z.string().describe("The full resume formatted as a Markdown string."),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;


export async function generateResume(
  input: GenerateResumeInput
): Promise<GenerateResumeOutput> {
  return generateResumeFlow(input);
}


const generateResumePrompt = ai.definePrompt({
  name: 'generateResumePrompt',
  input: {schema: GenerateResumeInputSchema},
  output: {schema: GenerateResumeOutputSchema},
  prompt: `You are an expert resume writer and career coach AI. Your task is to create a professional, skills-based resume for a user of the ATLAS app, which gamifies real-life activities. You must translate their in-app data into compelling, professional language.

**User Data:**
- Name: {{{userName}}}
- Archetype: {{{archetype}}} (This reflects their core personality and strengths)
- Level: {{{level}}}
- Traits: {{#each traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Skills & Experience (XP is a measure of time and dedication):**
{{#each skills}}
- {{name}} (Category: {{category}}, Experience Points: {{xp}})
{{/each}}

**Instructions:**
1.  **Format:** Generate the resume in Markdown format. Use '#' for the user's name, '##' for main sections (Summary, Skills, Experience, Achievements), and '###' for sub-sections (e.g., skill categories). Use bullet points for lists.
2.  **Summary Section:** Write a powerful, 2-3 sentence professional summary. Start with the user's archetype (e.g., "A 'Sage'-driven professional...") and highlight their key strengths based on their top skills and traits.
3.  **Skills Section:**
    *   Create a "Core Competencies" sub-section. List the user's top 5-7 skills (by XP) as a bulleted list.
    *   Create sub-sections for each skill category where the user has skills (e.g., "Technical Skills," "Creative Skills," "Physical Skills"). List the relevant skills under each.
4.  **Experience/Projects Section:**
    *   This is the most important section. Do NOT just list the skills again.
    *   **Synthesize activities into project-like experiences.** Group related skills into thematic projects.
    *   For each "project," write 2-3 bullet points describing accomplishments in professional terms. Quantify achievements using XP as a proxy for dedication.
5.  **Achievements/Traits Section:**
    *   List the user's earned traits under a sub-section titled "Key Traits."
    *   Briefly explain what each trait signifies in a professional context.

Now, generate the complete resume in Markdown.`,
});

const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async input => {
    const {output} = await generateResumePrompt(input);
    return output!;
  }
);
