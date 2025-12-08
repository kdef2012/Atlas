
'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a script for an ATLAS Radio broadcast.
 *
 * This flow acts as an AI DJ, creating an engaging radio show script based on
 * recent events and data from within the ATLAS world.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input data schemas for the different types of news
const FactionChallengeWinnerSchema = z.object({
  faction: z.string().describe('The winning faction/category, e.g., Physical.'),
  winningFireteamName: z.string().describe('The name of the top-scoring fireteam.'),
  winningRegion: z.string().describe('The region of the winning fireteam.'),
  challengeDescription: z.string().describe('The description of the challenge they won.'),
});

const TrendingSkillSchema = z.object({
  name: z.string().describe('The name of the trending skill.'),
  category: z.string().describe('The category of the skill.'),
});

const NewPioneerSkillSchema = z.object({
    name: z.string().describe('The name of the newly discovered skill.'),
    pioneerUserName: z.string().describe("The username of the user who discovered it."),
});


// Define the main input schema for the flow
const GenerateRadioBroadcastInputSchema = z.object({
  factionChallengeWinners: z.array(FactionChallengeWinnerSchema).optional().describe('A list of recent Faction Challenge winners.'),
  trendingSkills: z.array(TrendingSkillSchema).optional().describe('A list of skills that are currently popular.'),
  newlyPioneeredSkills: z.array(NewPioneerSkillSchema).optional().describe('A list of brand new skills discovered by users.'),
});
export type GenerateRadioBroadcastInput = z.infer<typeof GenerateRadioBroadcastInputSchema>;


// Define the output schema for the flow
const GenerateRadioBroadcastOutputSchema = z.object({
  script: z.string().describe('The complete, formatted script for the radio broadcast.'),
});
export type GenerateRadioBroadcastOutput = z.infer<typeof GenerateRadioBroadcastOutputSchema>;


// Exported function that other parts of the application can call
export async function generateRadioBroadcast(
  input: GenerateRadioBroadcastInput
): Promise<GenerateRadioBroadcastOutput> {
  return generateRadioBroadcastFlow(input);
}


// Define the prompt for the AI model
const generateRadioScriptPrompt = ai.definePrompt({
  name: 'generateRadioScriptPrompt',
  input: { schema: GenerateRadioBroadcastInputSchema },
  output: { schema: GenerateRadioBroadcastOutputSchema },
  prompt: `You are "DJ Nova", the host of ATLAS Radio, the official broadcast for the ATLAS universe. Your tone is energetic, futuristic, and encouraging. You celebrate player achievements and make the world feel alive.

Your task is to generate a short (2-3 minute) radio script based on the following data. You must weave these data points into a coherent and entertaining broadcast.

**Broadcast Data:**
{{#if factionChallengeWinners}}
- **Faction Challenge Winners:**
  {{#each factionChallengeWinners}}
  - The {{faction}} challenge ("{{challengeDescription}}") was won by **{{winningFireteamName}}** from {{winningRegion}}!
  {{/each}}
{{/if}}

{{#if trendingSkills}}
- **Trending Skills:**
  {{#each trendingSkills}}
  - {{name}} ({{category}})
  {{/each}}
{{/if}}

{{#if newlyPioneeredSkills}}
- **New Discoveries:**
  {{#each newlyPioneeredSkills}}
  - A new skill '{{name}}' was pioneered by **{{pioneerUserName}}**!
  {{/each}}
{{/if}}

**Instructions:**
1.  Start with a catchy intro, like "What's up, ATLAS! This is DJ Nova coming at you live from the heart of the Nebula!"
2.  Announce the Faction Challenge winners with hype and congratulations.
3.  Talk about the trending skills. Why do you think they're popular? Give a shout-out to the communities practicing them.
4.  Celebrate the pioneers of new skills. Emphasize how they are expanding the world for everyone.
5.  End with a positive and motivational sign-off.
6.  Keep the language exciting and use in-world slang (e.g., "log those stats," "climbing the leaderboards," "sync up," "new data streams").
7.  The final output should be a single block of text representing the entire script.

Now, generate the broadcast script!`,
});


// Define the Genkit flow
const generateRadioBroadcastFlow = ai.defineFlow(
  {
    name: 'generateRadioBroadcastFlow',
    inputSchema: GenerateRadioBroadcastInputSchema,
    outputSchema: GenerateRadioBroadcastOutputSchema,
  },
  async (input) => {
    const { output } = await generateRadioScriptPrompt(input);
    return output!;
  }
);
