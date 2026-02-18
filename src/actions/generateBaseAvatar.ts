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
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt,
    });

    if (!media || !media.url) {
      throw new Error('Avatar generation failed to return media.');
    }

    return { imageDataUri: media.url };
  } catch (error) {
    console.error('Base avatar generation error:', error);
    throw new Error('Failed to generate base avatar. Please try again.');
  }
}
