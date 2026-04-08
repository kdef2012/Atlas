
'use server';

/**
 * @fileOverview Defines a server action to generate a new 3D avatar image by applying cosmetics.
 * Uses gpt-image-1.5 for high-quality image-to-image editing.
 */
import { ai } from '@/ai/genkit';

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
  if (!input.baseAvatarDataUri) {
    throw new Error('Base avatar image is required');
  }

  let imageDataUri = input.baseAvatarDataUri;

  // If the input is a URL, fetch it and convert it to a data URI
  if (!imageDataUri.startsWith('data:image')) {
    try {
      const response = await fetch(imageDataUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type') || 'image/png';
      const buffer = Buffer.from(await response.arrayBuffer());
      imageDataUri = `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Failed to convert image URL to data URI:', error);
      throw new Error('Could not process the base avatar image URL.');
    }
  }


  // If no cosmetics, we can just return the base image.
  if (!input.cosmeticVisualDescriptions || input.cosmeticVisualDescriptions.length === 0) {
    return { generatedAvatarDataUri: imageDataUri };
  }

  const cosmeticsList = input.cosmeticVisualDescriptions
    .map((desc, i) => `${i + 1}. ${desc}`)
    .join('\n');

  const prompt = `Edit this 3D avatar image by applying the following cosmetic items while preserving the original style, lighting, and quality:

${cosmeticsList}

CRITICAL REQUIREMENTS:
- Maintain the exact same 3D render quality and lighting as the original
- The original image has a transparent background; ensure the output also has a fully transparent background.
- Preserve the character's pose, expression, and base clothing.
- Only add/modify the specified cosmetic items.
- Ensure cosmetics look naturally integrated with the 3D avatar style.
- Output ONLY the edited image with no text, watermarks, or explanations.`;

  const response = await ai.generate({
    model: 'googleai/imagen-3.0-generate-001',
    prompt: [
      { media: { url: imageDataUri } },
      { text: prompt }
    ],
    output: { format: 'media' }
  });

  const generatedAvatarDataUri = response.media?.url;

  if (!generatedAvatarDataUri) {
    throw new Error('Image generation failed to return a valid image.');
  }

  return { generatedAvatarDataUri };
}
