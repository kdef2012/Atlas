import OpenAI, { toFile } from 'openai';
import sharp from 'sharp';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Convert image buffer to RGBA PNG format (required for GPT-Image-1.5 editing)
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
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

/**
 * Generate a new image from scratch using gpt-image-1.5
 * 
 * @param prompt - Detailed description of the image to generate
 * @param quality - 'standard' ($0.040) or 'hd' ($0.080)
 * @param size - Image dimensions
 * @returns Base64 data URI of the generated image
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
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1.5',
      prompt,
      n: 1,
      size,
      quality,
    });

    // ✅ Fixed: Explicit null/undefined checks
    if (!response.data) {
      throw new Error('No data returned from gpt-image-1.5 API');
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from gpt-image-1.5 generation');
    }

    return await urlToDataUri(imageUrl);
  } catch (error) {
    console.error('GPT-Image-1.5 generation error:', error);
    throw new Error(
      `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Edit an existing image using gpt-image-1.5
 * 
 * NOTE: Editing uses different quality values than generation:
 * - Generation: 'standard' | 'hd'
 * - Editing: 'low' | 'medium' | 'high' | 'auto'
 * 
 * @param imageDataUri - Base64 data URI of the image to edit
 * @param prompt - Description of the edits to apply
 * @param quality - 'low' (fastest), 'medium' (balanced), 'high' (best quality), 'auto' (adaptive)
 * @param size - Output image dimensions
 * @returns Base64 data URI of the edited image
 */
export async function editImageWithGPTImage({
  imageDataUri,
  prompt,
  quality = 'medium',
  size = '1024x1024',
}: {
  imageDataUri: string;
  prompt: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  size?: '1024x1024' | '1024x1536' | '1536x1024';
}): Promise<string> {
  try {
    // Extract base64 data from data URI
    const base64Data = imageDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URI format - expected "data:image/png;base64,..."');
    }

    // Convert to RGBA PNG buffer (required by OpenAI API)
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const rgbaBuffer = await convertToRGBA(imageBuffer);

    // Create file object for OpenAI SDK
    const imageFile = await toFile(rgbaBuffer, 'image.png', {
      type: 'image/png',
    });

    const response = await openai.images.edit({
      model: 'gpt-image-1.5',
      image: imageFile,
      prompt,
      n: 1,
      size,
      quality,
    });

    // ✅ Fixed: Explicit null/undefined checks
    if (!response.data) {
      throw new Error('No data returned from gpt-image-1.5 API');
    }

    if (response.data.length === 0) {
      throw new Error('Empty data array returned from gpt-image-1.5 API');
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from gpt-image-1.5 editing');
    }

    return await urlToDataUri(imageUrl);
  } catch (error) {
    console.error('GPT-Image-1.5 editing error:', error);
    throw new Error(
      `Image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
