'use server';

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  // Convert data URI to buffer. The client is now responsible for ensuring
  // the image is a square RGBA PNG.
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

  if (!response.data || response.data.length === 0) {
    throw new Error('No data returned from DALL-E API');
  }

  const b64Image = response.data[0]?.b64_json;
  if (!b64Image) {
    throw new Error('No image returned from DALL-E');
  }

  return `data:image/png;base64,${b64Image}`;
}
