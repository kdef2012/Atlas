'use server';

/**
 * @fileOverview Defines a function to remove the background from an image, making it transparent.
 * This now uses OpenAI's DALL-E 2 for high-quality background removal.
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
    const prompt = "Remove the background from this image, making it transparent.";
    
    const generatedImageUrl = await editImageWithDALLE({
      imageDataUri: input.imageDataUri,
      prompt: prompt,
    });

    if (!generatedImageUrl) {
      throw new Error('Image generation failed to return a valid image for background removal.');
    }

    return { transparentImageDataUri: generatedImageUrl };
}