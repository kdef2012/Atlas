
import OpenAI, { toFile } from 'openai';
import sharp from 'sharp';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert image buffer to RGBA PNG format (required for image editing)
 */
async function convertToRGBA(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .ensureAlpha()
    .png()
    .toBuffer();
}

/**
 * Helper to fetch a remote image URL and convert it to a Base64 data URI
 */
async function urlToDataUri(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch generated image from ${url}: ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

/**
 * Generate a new image from scratch using gpt-image-1.5
 */
export async function generateImageWithGPTImage({
  prompt,
  quality = 'standard',
  size = '1024x1024',
}: {
  prompt: string;
  quality?: 'standard' | 'hd';
  size?: '1024x1024' | '1024x1792' | '1792x1024';
}): Promise<string> {
  const response = await openai.images.generate({
    model: 'gpt-image-1.5',
    prompt,
    n: 1,
    size: size as any,
    quality,
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from gpt-image-1.5 generation');
  }

  return await urlToDataUri(imageUrl);
}

/**
 * Edit an existing image using gpt-image-1.5
 */
export async function editImageWithGPTImage({
  imageDataUri,
  prompt,
  quality = 'medium',
  size = '1024x1024',
}: {
  imageDataUri: string;
  prompt: string;
  quality?: 'low' | 'medium' | 'high';
  size?: '1024x1024' | '1024x1536' | '1536x1024';
}): Promise<string> {
  const base64Data = imageDataUri.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid data URI format');
  }

  // Convert to RGBA PNG buffer
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const rgbaBuffer = await convertToRGBA(imageBuffer);

  // Use toFile from OpenAI SDK (correct way to pass images)
  const imageFile = await toFile(rgbaBuffer, 'avatar.png', {
    type: 'image/png',
  });

  const response = await openai.images.edit({
    model: 'gpt-image-1.5',
    image: imageFile,
    prompt,
    n: 1,
    size: size as any,
    quality,
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('No data returned from gpt-image-1.5 API');
  }

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from gpt-image-1.5 editing');
  }

  return await urlToDataUri(imageUrl);
}
