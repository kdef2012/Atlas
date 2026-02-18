
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
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('urlToDataUri error:', error);
    throw new Error(`Could not convert image URL to data URI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a new image from scratch using gpt-image-1.5
 * 
 * @param prompt - Detailed description of the image to generate
 * @param quality - 'low', 'medium', 'high', or 'auto'
 * @param size - Image dimensions
 * @returns Base64 data URI of the generated image
 */
export async function generateImageWithGPTImage({
  prompt,
  quality = 'medium',
  size = '1024x1024',
}: {
  prompt: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  size?: '1024x1024' | '1024x1536' | '1536x1024';
}): Promise<string> {
  try {
    // Use 'any' to bypass SDK-level defaulting or validation that might force quality to 'standard'
    const response = await (openai.images as any).generate({
      model: 'gpt-image-1.5',
      prompt,
      n: 1,
      size,
      quality,
    });

    if (!response.data || response.data.length === 0) {
      console.error('OpenAI Full Response (Empty Data):', JSON.stringify(response));
      throw new Error('No data returned from gpt-image-1.5 API');
    }

    const item = response.data[0];
    if (item.url) {
      return await urlToDataUri(item.url);
    } else if (item.b64_json) {
      return `data:image/png;base64,${item.b64_json}`;
    } else {
      console.error('OpenAI Data Object (Missing Image Data):', JSON.stringify(item));
      throw new Error('No image URL or Base64 data returned from gpt-image-1.5 generation');
    }
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
    const base64Data = imageDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid data URI format - expected "data:image/png;base64,..."');
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const rgbaBuffer = await convertToRGBA(imageBuffer);

    const imageFile = await toFile(rgbaBuffer, 'image.png', {
      type: 'image/png',
    });

    // Use 'any' to bypass SDK-level defaulting or validation that might force quality to 'standard'
    const response = await (openai.images as any).edit({
      model: 'gpt-image-1.5',
      image: imageFile,
      prompt,
      n: 1,
      size,
      quality,
    });

    if (!response.data || response.data.length === 0) {
      console.error('OpenAI Full Response (Empty Data):', JSON.stringify(response));
      throw new Error('No data returned from gpt-image-1.5 API');
    }

    const item = response.data[0];
    if (item.url) {
      return await urlToDataUri(item.url);
    } else if (item.b64_json) {
      return `data:image/png;base64,${item.b64_json}`;
    } else {
      console.error('OpenAI Data Object (Missing Image Data):', JSON.stringify(item));
      throw new Error('No image URL or Base64 data returned from gpt-image-1.5 editing');
    }
  } catch (error) {
    console.error('GPT-Image-1.5 editing error:', error);
    throw new Error(
      `Image editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
