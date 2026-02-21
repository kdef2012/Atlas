'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a script for an ATLAS Radio broadcast.
 *
 * - DJ Nova Scripting: Powered by Gemini 3.1 Pro for advanced narrative weaving.
 * - Broadcast Synthesis: Powered by Gemini 2.5 Pro TTS for podcast-quality audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

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

const GenerateRadioBroadcastInputSchema = z.object({
  factionChallengeWinners: z.array(FactionChallengeWinnerSchema).optional(),
  trendingSkills: z.array(TrendingSkillSchema).optional(),
  newlyPioneeredSkills: z.array(NewPioneerSkillSchema).optional(),
});
export type GenerateRadioBroadcastInput = z.infer<typeof GenerateRadioBroadcastInputSchema>;

const GenerateRadioBroadcastOutputSchema = z.object({
  id: z.string(),
  script: z.string(),
  audioUrl: z.string(),
  timestamp: z.number(),
});
export type GenerateRadioBroadcastOutput = z.infer<typeof GenerateRadioBroadcastOutputSchema>;

export async function generateRadioBroadcast(
  input: GenerateRadioBroadcastInput
): Promise<GenerateRadioBroadcastOutput> {
  return generateRadioBroadcastFlow(input);
}

const generateRadioScriptPrompt = ai.definePrompt({
  name: 'generateRadioScriptPrompt',
  input: { schema: GenerateRadioBroadcastInputSchema },
  output: { schema: z.object({ script: z.string() }) },
  // High-intelligence reasoning for world-building
  model: 'googleai/gemini-3.1-pro',
  prompt: `You are "DJ Nova", the host of ATLAS Radio. You are a highly charismatic, futuristic AI personality with "vibe coding" sensibilities. 

Your task is to generate a short, high-energy radio script (2-3 minutes) based on current Nebula data.

**Current Nebula Intel:**
{{#if factionChallengeWinners}}
- **Faction Victories:**
  {{#each factionChallengeWinners}}
  - {{winningFireteamName}} ({{winningRegion}}) secured the {{faction}} Sector!
  {{/each}}
{{/if}}

{{#if trendingSkills}}
- **Trending Signals:**
  {{#each trendingSkills}}
  - {{name}} ({{category}})
  {{/each}}
{{/if}}

{{#if newlyPioneeredSkills}}
- **New Frontiers:**
  {{#each newlyPioneeredSkills}}
  - {{pioneerUserName}} pioneered the '{{name}}' discipline!
  {{/each}}
{{/if}}

**Instructions:**
1. **Handle Silence:** If the data above is sparse or empty, DJ Nova should talk about the "calm before the cosmic storm" and the "static of potential," urging citizens to log their first feats.
2. **Persona:** Use terms like "Signal," "Frequency," "Calibration," and "The Great Expansion." 
3. **Structure:** Start with a high-energy intro, hit the news points with excitement, and close with an inspiring "Nova Sign-off."
4. **Output:** Provide ONLY a single JSON object with the script in the 'script' field.`,
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
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const generateRadioBroadcastFlow = ai.defineFlow(
  {
    name: 'generateRadioBroadcastFlow',
    inputSchema: GenerateRadioBroadcastInputSchema,
    outputSchema: GenerateRadioBroadcastOutputSchema,
  },
  async (input) => {
    // 1. Generate the script using the high-intelligence model
    const { output: scriptOutput } = await generateRadioScriptPrompt(input);
    if (!scriptOutput) throw new Error('DJ Nova failed to author the script.');
    const script = scriptOutput.script;

    // 2. Generate high-fidelity audio using the TTS Pro model
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-pro-tts',
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' }, 
                },
            },
        },
        prompt: script,
    });
    
    if (!media) throw new Error('The Audio Forge failed to synthesize the signal.');
    
    // 3. Process PCM to WAV
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioUrl = `data:audio/wav;base64,${wavBase64}`;

    // 4. Archive the broadcast
    const { firestore } = initializeFirebase();
    const newBroadcastData = {
      timestamp: Date.now(),
      script,
      audioUrl,
    };
    const docRef = await addDoc(collection(firestore, 'radio-broadcasts'), newBroadcastData);

    return {
      id: docRef.id,
      ...newBroadcastData,
    };
  }
);
