import OpenAI from 'openai';
import sharp from 'sharp';

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

  return response.choices[0]?.message?.content || '';
}

/**
 * Convert image to RGBA format (required by DALL-E)
 */
async function convertToRGBA(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .ensureAlpha() // Add alpha channel if missing
    .png() // Convert to PNG (supports RGBA)
    .toBuffer();
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
  // Convert data URI to buffer
  const base64Data = imageDataUri.split(',')[1];
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Convert to RGBA format (required by DALL-E)
  const rgbaBuffer = await convertToRGBA(imageBuffer);

  // Create a File object from buffer
  const imageFile = new File([rgbaBuffer], 'avatar.png', {
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

  // ✅ Fixed: Check if response.data exists
  if (!response.data || response.data.length === 0) {
    throw new Error('No data returned from DALL-E API');
  }

  const b64Image = response.data[0]?.b64_json;
  if (!b64Image) {
    throw new Error('No image returned from DALL-E');
  }

  return `data:image/png;base64,${b64Image}`;
}

/**
 * Alternative: Use DALL-E 2 with a mask for more precise editing
 */
export async function editImageWithMask({
  imageDataUri,
  maskDataUri,
  prompt,
}: {
  imageDataUri: string;
  maskDataUri: string;
  prompt: string;
}): Promise<string> {
  // Convert data URIs to buffers
  const imageBase64 = imageDataUri.split(',')[1];
  const maskBase64 = maskDataUri.split(',')[1];

  const imageBuffer = Buffer.from(imageBase64, 'base64');
  const maskBuffer = Buffer.from(maskBase64, 'base64');

  // Convert both to RGBA
  const rgbaImageBuffer = await convertToRGBA(imageBuffer);
  const rgbaMaskBuffer = await convertToRGBA(maskBuffer);

  // Create File objects
  const imageFile = new File([rgbaImageBuffer], 'avatar.png', {
    type: 'image/png',
  });
  const maskFile = new File([rgbaMaskBuffer], 'mask.png', {
    type: 'image/png',
  });

  const response = await openai.images.edit({
    model: 'dall-e-2',
    image: imageFile,
    mask: maskFile,
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json',
  });

  // ✅ Fixed: Check if response.data exists
  if (!response.data || response.data.length === 0) {
    throw new Error('No data returned from DALL-E API');
  }

  const b64Image = response.data[0]?.b64_json;
  if (!b64Image) {
    throw new Error('No image returned from DALL-E');
  }

  return `data:image/png;base64,${b64Image}`;
}

/**
 * Two-step process: Analyze with GPT-4o, then generate with DALL-E 3
 */
export async function generateAvatarWithGPT4oAndDALLE3({
  imageDataUri,
  cosmeticDescriptions,
}: {
  imageDataUri: string;
  cosmeticDescriptions: string[];
}): Promise<string> {
  // Step 1: Analyze the avatar with GPT-4o Vision
  const analysisPrompt = `Describe this 3D avatar in detail, including:
- Style (realistic, cartoon, anime, etc.)
- Pose and expression
- Current clothing and features
- Lighting and background
- Color palette

Be very specific and detailed.`;

  const analysis = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageDataUri,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: analysisPrompt,
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const avatarDescription = analysis.choices[0]?.message?.content || '';

  // Step 2: Generate new avatar with DALL-E 3
  const cosmeticsText = cosmeticDescriptions.join(', ');
  const generationPrompt = `${avatarDescription}

Now add these cosmetics: ${cosmeticsText}

Maintain the exact same style, pose, expression, and quality. Only add the cosmetics mentioned.`;

  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: generationPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    response_format: 'b64_json',
  });

  // ✅ Fixed: Check if imageResponse.data exists
  if (!imageResponse.data || imageResponse.data.length === 0) {
    throw new Error('No data returned from DALL-E 3 API');
  }

  const b64Image = imageResponse.data[0]?.b64_json;
  if (!b64Image) {
    throw new Error('No image returned from DALL-E 3');
  }

  return `data:image/png;base64,${b64Image}`;
}
