'use server';

/**
 * @fileOverview Defines a server action to generate a high-fidelity 2D base avatar using GenAI.
 * Forces a uniform AAA game aesthetic.
 */
import { ai } from '@/ai/genkit';

export interface GenerateBaseAvatarInput {
  gender: string;
  complexionName: string;
  complexionHex: string;
  hairStyle: string;
  bodyType: string;
  height: string;
}

export interface GenerateBaseAvatarOutput {
  imageDataUri: string;
}

/**
 * Utility to convert a remote image URL to a Base64 Data URI.
 * This is necessary because our image-to-image pipeline requires local image data.
 */
async function urlToDataUri(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch generated image: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting URL to Data URI:', error);
    throw new Error('Could not process the generated image data.');
  }
}

export async function generateBaseAvatar(
  input: GenerateBaseAvatarInput
): Promise<GenerateBaseAvatarOutput> {
  // STRICT PROMPT TEMPLATE for visual uniformity
  const prompt = `A professional 3D character portrait of a ${input.gender} with ${input.complexionName} skin (color reference hex: ${input.complexionHex}). 
  Hair style: ${input.hairStyle}. 
  Body type: ${input.bodyType}, height: ${input.height}. 
  Wearing a simple, minimalist neutral dark-gray futuristic base-layer bodysuit. 
  Facing forward, neutral expression, medium shot. 
  Cinematic studio lighting, soft realistic shadows. 
  Style: High-fidelity stylized 3D render, smooth surfaces, clean edges, AAA game quality (Overwatch/Fortnite aesthetic). 
  Background: Solid flat neutral medium-gray studio background.`;

  try {
    // Using imagen-3 as it is currently the most stable and high-quality production model for text-to-image.
    const { media } = await ai.generate({
      model: 'googleai/imagen-3',
      prompt,
    });

    if (!media || !media.url) {
      throw new Error('Avatar generation system failed to return a valid image.');
    }

    // Convert the cloud storage URL to a Data URI for the next step in the pipeline (Background Removal)
    const imageDataUri = await urlToDataUri(media.url);

    return { imageDataUri };
  } catch (error: any) {
    console.error('Base avatar generation error details:', error);
    const detail = error?.message || 'Unknown AI error';
    throw new Error(`Failed to generate base avatar: ${detail}. Please try again.`);
  }
}
