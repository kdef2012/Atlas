'use server';

/**
 * @fileOverview Server action to generate high-fidelity 2D base avatars using gpt-image-1.5.
 * Creates consistent, AAA game-quality character portraits with uniform styling.
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

/**
 * Generate a base avatar character portrait using GPT-Image-1.5
 * 
 * Creates a consistent 3D-style character portrait with:
 * - AAA game aesthetic (Overwatch/Fortnite style)
 * - Uniform plain white t-shirt
 * - Professional studio lighting
 * - Clean, centered composition
 * 
 * @param input - Character customization parameters
 * @returns Data URI of the generated avatar image
 */
export async function generateBaseAvatar(
  input: GenerateBaseAvatarInput
): Promise<GenerateBaseAvatarOutput> {
  // Construct detailed prompt for visual consistency
  // Updated attire to a plain white t-shirt as requested
  const prompt = `A professional 3D character portrait of a ${input.gender} with ${input.complexionName} skin (hex: ${input.complexionHex}). 
Hair style: ${input.hairStyle}. 
Body type: ${input.bodyType}, height: ${input.height}. 
Wearing a simple, plain white short-sleeved t-shirt with a clean fit. 
Character is facing forward with a confident neutral expression, medium shot framing from waist up, centered in frame. 
Cinematic studio lighting with soft realistic shadows and rim lighting for depth. 
Style: High-fidelity stylized 3D render with smooth surfaces, clean edges, and polished materials. 
AAA game character quality matching Overwatch or Fortnite aesthetic - vibrant but grounded, heroic proportions. 
Background: Solid flat neutral medium-gray (#808080) studio background, no gradients or textures. 
Render quality: Sharp details, clean anti-aliased edges, professional game asset quality.`;

  try {
    const imageDataUri = await generateImageWithGPTImage({
      prompt,
      quality: 'medium', // Valid quality value for gpt-image-1.5
      size: '1024x1024',
    });

    return { imageDataUri };
  } catch (error: unknown) {
    console.error('Base avatar generation failed:', error);
    
    // Provide helpful error message to user
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred during image generation';
    
    throw new Error(
      `Failed to generate base avatar: ${errorMessage}. Please try again or contact support if the issue persists.`
    );
  }
}

/**
 * Generate multiple avatar variations for user selection
 * Useful for onboarding flow where users can choose from several options
 */
export async function generateAvatarVariations(
  input: GenerateBaseAvatarInput,
  count: number = 3
): Promise<GenerateBaseAvatarOutput[]> {
  const variations = await Promise.all(
    Array.from({ length: count }, (_, i) => 
      generateBaseAvatar({
        ...input,
        // Add slight variation to prompts for diversity
        hairStyle: i === 0 ? input.hairStyle : `${input.hairStyle} (variation ${i + 1})`,
      })
    )
  );
  
  return variations;
}
