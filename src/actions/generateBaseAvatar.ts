'use server';

/**
 * @fileOverview Server action to generate high-fidelity 2D base avatars using DALL-E 3.
 * Creates consistent, AAA game-quality character portraits with uniform styling.
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GenerateBaseAvatarInput {
  gender: string;
  complexionName: string;
  complexionHex: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  height: string;
  ageRange: string;
  facialHair: string;
  glasses: string;
}

export interface GenerateBaseAvatarOutput {
  imageDataUri: string;
}

export async function generateBaseAvatar(
  input: GenerateBaseAvatarInput
): Promise<GenerateBaseAvatarOutput> {
  const glassesDesc = input.glasses === 'None' ? '' : `Wearing ${input.glasses}.`;
  const facialHairDesc = input.facialHair === 'Clean Shaven' ? 'Clean shaven face.' : `Facial hair style: ${input.facialHair}.`;
  
  const prompt = `A professional 3D character portrait of a ${input.gender} portrayed as a ${input.ageRange} with ${input.complexionName} skin. 
Hair style: ${input.hairStyle} in a ${input.hairColor} color. 
Eyes: Striking ${input.eyeColor} eyes.
${facialHairDesc}
${glassesDesc}
Body type: ${input.bodyType}, height: ${input.height}. 
Wearing a simple, plain white short-sleeved t-shirt with a clean fit. 
Character is facing forward with a confident neutral expression, medium shot framing from waist up, centered in frame. 
Cinematic studio lighting with soft realistic shadows and rim lighting for depth. 
Style: High-fidelity stylized 3D render with smooth surfaces, clean edges, and polished materials. 
AAA game character quality matching Overwatch or Fortnite aesthetic - vibrant but grounded, heroic proportions. 
Background: Solid flat neutral medium-gray (#808080) studio background, no gradients or textures. 
Render quality: Sharp details, clean anti-aliased edges, professional game asset quality.`;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const base64 = response.data?.[0]?.b64_json;
    if (!base64) {
      throw new Error('OpenAI failed to return a valid base64 image.');
    }

    const imageDataUri = `data:image/png;base64,${base64}`;
    return { imageDataUri };
  } catch (error: unknown) {
    console.error('Base avatar generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during image generation';
    throw new Error(`Failed to generate base avatar: ${errorMessage}. Please try again or contact support if the issue persists.`);
  }
}
