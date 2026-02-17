'use server';

/**
 * @fileOverview Defines a server action to generate a new 3D avatar image by applying cosmetics.
 * Uses gpt-image-1.5 for high-quality image-to-image editing.
 */
import { editImageWithGPTImage } from '@/ai/openai';

// Define the input type for the function
export interface GenerateAvatarImageInput {
  baseAvatarDataUri: string;
  cosmeticVisualDescriptions: string[];
  quality?: 'low' | 'medium' | 'high';
}

// Define the output type for the function
export interface GenerateAvatarImageOutput {
  generatedAvatarDataUri: string;
}

export async function generateAvatarImage(
  input: GenerateAvatarImageInput
): Promise<GenerateAvatarImageOutput> {
  if (!input.baseAvatarDataUri) {
    throw new Error('Base avatar image is required');
  }

  if (!input.cosmeticVisualDescriptions.length) {
    throw new Error('At least one cosmetic description is required');
  }

  const cosmeticsList = input.cosmeticVisualDescriptions
    .map((desc, i) => `${i + 1}. ${desc}`)
    .join('\n');

  const prompt = `Edit this 3D avatar image by applying the following cosmetic items while preserving the original style, lighting, and quality:

${cosmeticsList}

CRITICAL REQUIREMENTS:
- Maintain the exact same 3D render quality and lighting as the original
- Keep the original character's background
- Preserve the character's pose, expression, and base clothing
- Only add/modify the specified cosmetic items
- Ensure cosmetics look naturally integrated with the 3D avatar style
- Output ONLY the edited image with no text, watermarks, or explanations`;

  const generatedAvatarDataUri = await editImageWithGPTImage({
    imageDataUri: input.baseAvatarDataUri,
    prompt,
    quality: input.quality ?? 'medium',
  });

  if (!generatedAvatarDataUri) {
    throw new Error('Image generation failed to return a valid image.');
  }

  return { generatedAvatarDataUri };
}