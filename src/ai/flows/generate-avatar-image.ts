
'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a new 3D avatar image by applying cosmetics and maintaining style.
 * This flow uses the Gemini 2.5 Flash Image model for high-fidelity image-to-image editing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { MediaPart } from 'genkit';

// Define the input schema for the flow
const GenerateAvatarImageInputSchema = z.object({
  baseAvatarDataUri: z.string().describe("The base 3D avatar image as a data URI."),
  cosmeticVisualDescriptions: z.array(z.string()).describe("An array of visual descriptions for the cosmetics to apply (e.g., 'a red Christmas hat', 'green eyeliner')."),
});
export type GenerateAvatarImageInput = z.infer<typeof GenerateAvatarImageInputSchema>;

// Define the output schema for the flow
const GenerateAvatarImageOutputSchema = z.object({
  generatedAvatarDataUri: z.string().describe("The new 3D avatar image with cosmetics applied, as a data URI."),
});
export type GenerateAvatarImageOutput = z.infer<typeof GenerateAvatarImageOutputSchema>;


export async function generateAvatarImage(
  input: GenerateAvatarImageInput
): Promise<GenerateAvatarImageOutput> {
  return generateAvatarImageFlow(input);
}

const generateAvatarImageFlow = ai.defineFlow(
  {
    name: 'generateAvatarImageFlow',
    inputSchema: GenerateAvatarImageInputSchema,
    outputSchema: GenerateAvatarImageOutputSchema,
  },
  async (input) => {
    
    // 1. Construct the prompt text, emphasizing 3D rendering and transparency
    const promptText = `
      You are an expert 3D avatar rendering engine.
      Edit the provided base avatar image directly.
      Apply the following cosmetic effects: ${input.cosmeticVisualDescriptions.join(', ')}.
      
      Maintain the existing 3D render quality and lighting.
      The final output must be ONLY the edited 3D avatar image on a transparent background, with no text or explanation.
      Do not change the pose or clothing unless explicitly requested in the cosmetics list.
    `;
    
    // 2. Build the prompt array for image-to-image task
    const promptParts = [
        { media: { url: input.baseAvatarDataUri } },
        { text: promptText }
    ];
    
    // 3. Call the Gemini image-to-image model
    const { media } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-latest'),
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
      },
    });
    
    if (!media?.url) {
      throw new Error('Image generation failed to return a valid image using gemini-1.5-pro-latest.');
    }

    return { generatedAvatarDataUri: media.url };
  }
);
