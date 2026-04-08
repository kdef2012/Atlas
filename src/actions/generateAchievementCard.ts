
'use server';

/**
 * @fileOverview Server action to generate high-fidelity achievement cards using gpt-image-1.5.
 * Creates branded, social-media-ready graphics for skill Pioneers.
 */

import { ai } from '@/ai/genkit';

export interface AchievementCardInput {
  avatarUrl: string;
  skillName: string;
  category: string;
  userName: string;
}

export interface AchievementCardOutput {
  cardDataUri: string;
}

/**
 * Synthesize a branded achievement card using the user's Twinskie as a base.
 */
export async function generateAchievementCard(
  input: AchievementCardInput
): Promise<AchievementCardOutput> {
  if (!input.avatarUrl) {
    throw new Error('Avatar image is required to forge an achievement card.');
  }

  // Ensure we have a data URI for the AI processing
  let imageDataUri = input.avatarUrl;
  if (!imageDataUri.startsWith('data:image')) {
    try {
      const response = await fetch(imageDataUri);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const contentType = response.headers.get('content-type') || 'image/png';
      const buffer = Buffer.from(await response.arrayBuffer());
      imageDataUri = `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Failed to convert image URL to data URI:', error);
      throw new Error('Could not process the Pioneer signature.');
    }
  }

  const prompt = `Transform this character portrait into a high-end, futuristic "Discovery Card" for the ATLAS Nebula.
  
  The card celebrates the user "${input.userName}" for Pioneering the discipline: "${input.skillName}" (${input.category}).
  
  CRITICAL VISUAL REQUIREMENTS:
  - Place the character in the center, framed by glowing holographic UI elements.
  - Include the text "PIONEER" and "${input.skillName}" in a bold, sharp futuristic font at the top.
  - Use a professional AAA game trading card aesthetic (sleek, metallic, glass textures).
  - The energy color scheme must be themed around ${input.category} energy.
  - Add a small "ATLAS" logo in one of the corners.
  - High-res, cinematic lighting with lens flares and particle effects.
  - Output ONLY the finished card graphic with NO extra text, labels, or watermarks outside the card frame.`;

  try {
    const response = await ai.generate({
      model: 'googleai/imagen3',
      prompt: [
        { media: { url: imageDataUri } },
        { text: prompt }
      ],
      output: { format: 'media' },
      config: {
        aspectRatio: '1:1',
      }
    });

    const cardDataUri = response.media?.url;
    
    if (!cardDataUri) throw new Error('Imagen 3 failed to return media output.');

    return { cardDataUri };
  } catch (error) {
    console.error('Achievement card generation failed:', error);
    throw new Error('The Achievement Forge is currently overloaded. Please try again in a few moments.');
  }
}
