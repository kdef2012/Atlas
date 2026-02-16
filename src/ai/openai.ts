
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper function to generate images using GPT-4o Vision
 */
export async function generateImageWithGPT4o({
  imageUrl,
  prompt,
}: {
  imageUrl: string;
  prompt: string;
}): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  // Note: GPT-4o Vision doesn't generate images, it analyzes them
  // For actual image generation, we need DALL-E 3
  return response.choices[0]?.message?.content || '';
}

/**
 * Edit/generate images using DALL-E 2 with image input
 */
export async function editImageWithDALLE({
  imageDataUri,
  prompt,
}: {
  imageDataUri: string;
  prompt: string;
}): Promise<string> {

  // Convert data URI to buffer. The imageDataUri is now expected to be a pre-converted square RGBA PNG.
  const base64Data = imageDataUri.split(',')[1];
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Create a File object from buffer
  const imageFile = new File([imageBuffer], 'avatar.png', {
    type: 'image/png',
  });

  // DALL-E 2 edit endpoint (DALL-E 3 doesn't support editing yet)
  const response = await openai.images.edit({
    model: 'dall-e-2',
    image: imageFile,
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });

  const b64Image = response.data?.[0]?.b64_json;
  if (!b64Image) {
    throw new Error('No image returned from DALL-E');
  }

  return `data:image/png;base64,${b64Image}`;
}
