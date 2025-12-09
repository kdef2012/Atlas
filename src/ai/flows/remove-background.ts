
'use server';

/**
 * @fileOverview Defines a Genkit flow to remove the background from an image, making it transparent.
 * This is used to process avatars upon creation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { MediaPart } from '@genkit-ai/core';

// Define the input schema for the flow
const RemoveBackgroundInputSchema = z.object({
  imageDataUri: z.string().describe("The image to process, as a data URI."),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

// Define the output schema for the flow
const RemoveBackgroundOutputSchema = z.object({
  transparentImageDataUri: z.string().describe("The processed image with a transparent background, as a data URI."),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

// Exported function that other parts of the application can call
export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

// Define the Genkit flow
const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    
    // 1. Construct the prompt text
    const promptText = `
      You are an expert image editor.
      Your task is to perfectly remove the background from the provided image, making it transparent.
      The subject of the image should be preserved in full detail with clean edges.
      The output must be ONLY the edited image with a transparent background.
    `;
    
    // 2. Build the prompt array for image-to-image task
    const promptParts: (string | MediaPart)[] = [
        { media: { url: input.imageDataUri } },
        { text: promptText }
    ];
    
    // 3. Call the Gemini image-to-image model
    const { media } = await ai.generate({
      model: googleAI.model('gemini-1.5-pro-latest'), // Using a more powerful model to avoid rate limits
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
      },
    });
    
    if (!media?.url) {
      throw new Error('Background removal failed to return a valid image.');
    }

    return { transparentImageDataUri: media.url };
  }
);
