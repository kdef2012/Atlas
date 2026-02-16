
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

  /**
   * Converts an image data URI to a square, RGBA PNG format required by DALL-E.
   */
  const convertToSquareRgbaPng = (dataUri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // DALL-E requires square images (256, 512, or 1024). We'll use 1024.
        const size = 1024;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        
        // Make background transparent to ensure RGBA format.
        ctx.clearRect(0, 0, size, size);

        // Calculate aspect ratio to draw the image centered without stretching.
        const hRatio = size / img.width;
        const vRatio = size / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (size - img.width * ratio) / 2;
        const centerShiftY = (size - img.height * ratio) / 2;
        
        ctx.drawImage(
            img, 0, 0, img.width, img.height,
            centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
        );

        // This will now be a square RGBA data URL.
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => reject(new Error(`Image could not be loaded: ${e.toString()}`));
      img.src = dataUri;
    });
  };

  // Convert input image to a square RGBA PNG to meet DALL-E requirements.
  const squareRgbaImageDataUri = await convertToSquareRgbaPng(imageDataUri);

  // Convert data URI to buffer
  const base64Data = squareRgbaImageDataUri.split(',')[1];
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
