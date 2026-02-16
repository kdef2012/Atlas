'use server';

/**
 * @fileOverview Defines a server action to remove the background from an image.
 * This uses OpenAI's DALL-E 2 for image editing.
 */

import { editImageWithDALLE } from '@/ai/openai';

// Define the input type for the function
export interface RemoveBackgroundInput {
  imageDataUri: string;
}

// Define the output type for the function
export interface RemoveBackgroundOutput {
  transparentImageDataUri: string;
}

// Exported function that other parts of the application can call
export async function removeBackground(
  input: RemoveBackgroundInput
): Promise<RemoveBackgroundOutput> {
    
    const prompt = `
      Perfectly remove the background from the provided avatar, making it transparent.
      The subject of the image should be preserved in full detail with clean edges.
    `;
    
    const editedImageUrl = await editImageWithDALLE({
      imageDataUri: input.imageDataUri,
      prompt: prompt,
    });
    
    if (!editedImageUrl) {
      throw new Error('Background removal failed to return a valid image.');
    }

    return { transparentImageDataUri: editedImageUrl };
}
