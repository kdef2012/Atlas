
'use server';

/**
 * @fileOverview Defines a server action to generate a new 3D avatar image by applying cosmetics.
 * This now uses OpenAI's DALL-E 2 for image editing.
 */
import { editImageWithDALLE } from '@/ai/openai';

// Define the input type for the function
export interface GenerateAvatarImageInput {
  baseAvatarDataUri: string;
  cosmeticVisualDescriptions: string[];
}

// Define the output type for the function
export interface GenerateAvatarImageOutput {
  generatedAvatarDataUri: string;
}


export async function generateAvatarImage(
  input: GenerateAvatarImageInput
): Promise<GenerateAvatarImageOutput> {
    
    const prompt = `
      Apply the following cosmetic effects to the avatar: ${input.cosmeticVisualDescriptions.join(', ')}.
      Maintain the existing 3D render quality and lighting.
      The final output must be ONLY the edited 3D avatar image on a transparent background.
    `;
    
    const generatedImageUrl = await editImageWithDALLE({
      imageDataUri: input.baseAvatarDataUri,
      prompt: prompt,
    });

    if (!generatedImageUrl) {
      throw new Error('Image generation failed to return a valid image.');
    }

    return { generatedAvatarDataUri: generatedImageUrl };
}
