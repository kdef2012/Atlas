'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a script for an ATLAS Radio broadcast.
 *
 * This flow acts as an AI DJ, creating an engaging radio show script based on
 * recent events and data from within the ATLAS world, and then converts that script to audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

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
  id: z.string(),
  script: z.string().describe('The complete, formatted script for the radio broadcast.'),
  audioUrl: z.string().describe('A base64 encoded data URI of the generated WAV audio.'),
  timestamp: z.number(),
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
  output: { schema: z.object({ script: z.string() }) },
  // Powered by Gemini 1.5 Pro for higher creative reasoning
  // ✅ FIXED: Updated to use '-latest' suffix to resolve 404
  model: 'googleai/gemini-1.5-pro-latest',
  prompt: `You are "DJ Nova", the host of ATLAS Radio, the official broadcast for the ATLAS universe. Your tone is energetic, futuristic, and encouraging. You celebrate player achievements and make the world feel alive.

Your task is to generate a short (2-3 minute) radio script based on the following data. 

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
1.  **Empty Data (Radio Silence):** If no specific winners, trending skills, or pioneers are listed above, do NOT report an error. Instead, generate a "System Warm-up" script. Talk about the "growing energy in the Nebula", the "arrival of new signatures", and encourage citizens to log their first feats to break the silence.
2.  Start with a catchy intro, like "What's up, ATLAS! This is DJ Nova coming at you live from the heart of the Nebula!"
3.  Announce any data points with hype and congratulations.
4.  End with a positive and motivational sign-off.
5.  The final output must be a single JSON object containing the entire script in the 'script' field.

Now, generate the broadcast script!`,
});


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


// Define the Genkit flow
const generateRadioBroadcastFlow = ai.defineFlow(
  {
    name: 'generateRadioBroadcastFlow',
    inputSchema: GenerateRadioBroadcastInputSchema,
    outputSchema: GenerateRadioBroadcastOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the script
    const { output: scriptOutput } = await generateRadioScriptPrompt(input);
    if (!scriptOutput) {
        throw new Error('Failed to generate radio script.');
    }
    const script = scriptOutput.script;

    // Step 2: Generate audio from the script
    // Powered by Gemini 1.5 Pro
    // ✅ FIXED: Updated to use '-latest' suffix to resolve 404
    const { media } = await ai.generate({
        model: 'googleai/gemini-1.5-pro-latest',
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' }, // An energetic, clear voice
                },
            },
        },
        prompt: script,
    });
    
    if (!media) {
        throw new Error('TTS model did not return any audio media.');
    }
    
    // Step 3: Convert raw PCM audio to WAV format
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    const audioUrl = `data:audio/wav;base64,${wavBase64}`;

    // Step 4: Save the broadcast to Firestore
    const { firestore } = initializeFirebase();
    const broadcastsCollection = collection(firestore, 'radio-broadcasts');
    const newBroadcastData = {
      timestamp: Date.now(),
      script,
      audioUrl,
    };
    const docRef = await addDoc(broadcastsCollection, newBroadcastData);

    // Step 5: Return both script and audio URL along with the new document ID
    return {
      id: docRef.id,
      ...newBroadcastData,
    };
  }
);