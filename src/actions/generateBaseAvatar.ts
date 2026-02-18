
'use server';

/**
 * @fileOverview Defines a server action to generate a high-fidelity 2D base avatar using gpt-image-1.5.
 * Forces a uniform AAA game aesthetic.
 */
import { generateImageWithGPTImage } from '@/ai/openai';

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
  const prompt = `A professional 3D character portrait of a ${input.gender} with ${input.complexionName} skin. 
  Hair style: ${input.hairStyle}. 
  Body type: ${input.bodyType}, height: ${input.height}. 
  Wearing a simple, minimalist neutral dark-gray futuristic base-layer bodysuit. 
  Facing forward, neutral expression, medium shot. 
  Cinematic studio lighting, soft realistic shadows. 
  Style: High-fidelity stylized 3D render, smooth surfaces, clean edges, AAA game quality (Overwatch/Fortnite aesthetic). 
  Background: Solid flat neutral medium-gray studio background.`;

  try {
    const imageDataUri = await generateImageWithGPTImage({
      prompt,
      quality: 'standard',
      size: '1024x1024',
    });

    return { imageDataUri };
  } catch (error: any) {
    console.error('Base avatar generation error details:', error);
    const detail = error?.message || 'Unknown AI error';
    throw new Error(`Failed to generate base avatar: ${detail}. Please try again.`);
  }
}
