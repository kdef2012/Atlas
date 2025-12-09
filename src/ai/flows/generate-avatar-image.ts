
'use server';

/**
 * @fileOverview Defines a Genkit flow to apply cosmetic effects to an avatar image.
 *
 * This flow uses an advanced image-to-image model to "repaint" a base avatar
 * with dynamic effects like glows, auras, and backgrounds.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import fetch from 'node-fetch';

const GenerateAvatarImageInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the base avatar image (PNG format).'),
  prompt: z.string().describe('A text prompt describing the desired cosmetic effect (e.g., "add a fiery aura").'),
});
export type GenerateAvatarImageInput = z.infer<typeof GenerateAvatarImageInputSchema>;

const GenerateAvatarImageOutputSchema = z.object({
  generatedImageUrl: z.string().describe('The data URI of the newly generated avatar image.'),
});
export type GenerateAvatarImageOutput = z.infer<typeof GenerateAvatarImageOutputSchema>;

// Exported function that the application can call
export async function generateAvatarImage(
  input: GenerateAvatarImageInput
): Promise<GenerateAvatarImageOutput> {
  return generateAvatarImageFlow(input);
}


// Function to download an image and convert it to a data URI
async function imageUrlToDataUri(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
}


// Define the Genkit flow
const generateAvatarImageFlow = ai.defineFlow(
  {
    name: 'generateAvatarImageFlow',
    inputSchema: GenerateAvatarImageInputSchema,
    outputSchema: GenerateAvatarImageOutputSchema,
  },
  async (input) => {
    // Step 1: Convert the input image URL to a data URI
    const baseImageDataUri = await imageUrlToDataUri(input.imageUrl);

    // Step 2: Call the image generation model
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: [
        { media: { url: baseImageDataUri, contentType: 'image/png' } },
        { text: `Apply the following effect to the character in the image: ${input.prompt}. Do not change the character's appearance, only add the effect around them or as a background.` },
      ],
      config: {
        responseModalities: ['IMAGE'], // We only want an image back
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media object.');
    }
    
    // Step 3: Return the generated image URL
    return {
      generatedImageUrl: media.url,
    };
  }
);
