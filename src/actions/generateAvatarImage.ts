
'use server';

/**
 * @fileOverview Defines a server action to generate a new 3D avatar image by applying cosmetics.
 * Uses GPT-4o-mini to analyze the base character and DALL-E 3 to synthesize the new image.
 */
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GenerateAvatarImageInput {
  baseAvatarDataUri: string;
  cosmeticVisualDescriptions: string[];
}

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

  if (!input.cosmeticVisualDescriptions || input.cosmeticVisualDescriptions.length === 0) {
    return { generatedAvatarDataUri: imageDataUri };
  }

  // 1. Analyze the original character using GPT-4 Vision
  const descriptionResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this 3D video game character in extreme detail, including their gender, build, skin tone, hair style, facial hair, eye color, and exact base clothing. Output ONLY the visual description." },
          { type: "image_url", image_url: { url: imageDataUri } }
        ]
      }
    ]
  });

  const baseDescription = descriptionResponse.choices[0].message.content;

  // 2. Synthesize new image with cosmetics using DALL-E 3
  const cosmeticsList = input.cosmeticVisualDescriptions
    .map((desc, i) => `${i + 1}. ${desc}`)
    .join('\n');

  const finalPrompt = `A professional 3D character portrait. 
BASE CHARACTER EXACT DETAILS to recreate: ${baseDescription}.

CRITICAL NEW ADDITIONS: You MUST add the following cosmetic items to the character:
${cosmeticsList}

REQUIREMENTS:
- Background: Solid flat neutral medium-gray (#808080) studio background.
- Style: AAA game character quality matching Overwatch or Fortnite aesthetic. 
- Composition: Character is facing forward with a confident neutral expression, medium shot framing from waist up, centered in frame.
- High-fidelity stylized 3D render with smooth surfaces, clean edges, and polished materials.`;

  const imageResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: finalPrompt,
    n: 1,
    size: "1024x1024",
    response_format: "b64_json",
  });

  const base64 = imageResponse.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error('Image generation failed to return a valid image.');
  }

  return { generatedAvatarDataUri: `data:image/png;base64,${base64}` };
}

