'use server';

/**
 * @fileOverview Defines a function to remove the background from an image, making it transparent.
 * Uses gpt-image-1.5 for high-quality background removal.
 */
import { editImageWithGPTImage } from '@/ai/openai';

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
  const prompt = `Remove the background from this avatar image completely, making it fully transparent.
  
CRITICAL REQUIREMENTS:
- Preserve the subject (avatar/character) in full detail with clean, precise edges
- Make the entire background completely transparent
- Do not alter the avatar's appearance, colors, or style in any way
- Output ONLY the avatar on a transparent background`;

  const transparentImageDataUri = await editImageWithGPTImage({
    imageDataUri: input.imageDataUri,
    prompt,
    quality: 'high',
  });

  if (!transparentImageDataUri) {
    throw new Error('Background removal failed to return a valid image.');
  }

  return { transparentImageDataUri };
}
