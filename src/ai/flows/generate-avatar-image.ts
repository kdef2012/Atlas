
'use server';

/**
 * @fileOverview Defines a Genkit flow to generate a complete avatar image from a text description.
 *
 * This flow uses a text-to-image model to create a new avatar portrait
 * based on user archetype and a cosmetic effect prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateAvatarImageInputSchema = z.object({
  archetype: z.string().describe('The user\'s archetype (e.g., Titan, Sage, Maverick).'),
  prompt: z.string().describe('A text prompt describing the desired character appearance and cosmetic effect (e.g., "A powerful Titan with a fiery aura").'),
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

// Define the Genkit flow
const generateAvatarImageFlow = ai.defineFlow(
  {
    name: 'generateAvatarImageFlow',
    inputSchema: GenerateAvatarImageInputSchema,
    outputSchema: GenerateAvatarImageOutputSchema,
  },
  async (input) => {
    // Step 1: Call the image generation model
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Generate a full-body portrait of a futuristic RPG character.
      
      - Character Archetype: ${input.archetype}
      - Effect / Style: ${input.prompt}
      
      The character should be the central focus, viewed from the front. The background should be simple and dark to emphasize the character and the effect.`,
      config: {
        // You can add configuration like aspect ratio if needed, e.g., aspectRatio: '1:1'
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a media object.');
    }
    
    // Step 2: Return the generated image URL
    return {
      generatedImageUrl: media.url,
    };
  }
);
