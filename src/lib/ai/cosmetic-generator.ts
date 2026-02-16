

import { generateWithOpenAI } from './openai-client';
import type { GeneratedCosmetic } from './activity-analyzer';

export interface CosmeticGenerationRequest {
  visualDescription: string;
  position: 'head' | 'face' | 'body' | 'background' | 'aura';
  color: string;
  style?: 'simple' | 'detailed' | 'minimalist' | 'ornate';
}

export interface GeneratedCosmeticWithAssets extends GeneratedCosmetic {
  svgCode: string;
  cssEffects: {
    boxShadow?: string;
    border?: string;
    background?: string;
    filter?: string;
  };
  overlayPosition?: {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    transform?: string;
  };
}

/**
 * Generate complete cosmetic with SVG and CSS
 */
export async function generateCompleteCosmetic(
  cosmetic: GeneratedCosmetic
): Promise<GeneratedCosmeticWithAssets> {
  // Generate SVG
  const svgCode = await generateSVG(
    cosmetic.visualDescription,
    cosmetic.position,
    cosmetic.color || '#000000'
  );
  
  // Generate CSS effects
  const cssEffects = generateCSSEffects(cosmetic);
  
  // Calculate overlay position
  const overlayPosition = calculateOverlayPosition(cosmetic.position);
  
  return {
    ...cosmetic,
    svgCode,
    cssEffects,
    overlayPosition,
  };
}

/**
 * Generate SVG code from visual description using OpenAI
 */
export async function generateSVG(
  visualDescription: string,
  position: string | undefined,
  primaryColor: string
): Promise<string> {
  const systemInstruction = `You are an SVG generator. Create simple, clean SVG code for avatar cosmetics.

Requirements:
- ViewBox: 0 0 200 200
- Use simple shapes (circles, paths, polygons)
- Maximum 10 elements
- Use provided primary color
- Make it scalable
- No complex gradients
- Educational/game-appropriate style`;

  const prompt = `Generate SVG code for this cosmetic item:

Description: ${visualDescription}
Position on avatar: ${position}
Primary Color: ${primaryColor}

Create a simple, recognizable SVG that captures the essence of this description.

Return ONLY the SVG code, no explanation, no markdown formatting.

Example format:
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="${primaryColor}"/>
  <!-- more elements -->
</svg>`;

  try {
    const response = await generateWithOpenAI(prompt, systemInstruction);
    let svgCode = response.text.trim();
    
    // Extract SVG if wrapped in markdown
    const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      svgCode = svgMatch[0];
    }
    
    // Validate SVG
    if (!svgCode.startsWith('<svg') || !svgCode.endsWith('</svg>')) {
      throw new Error('Invalid SVG generated');
    }
    
    return svgCode;
  } catch (error) {
    console.error('SVG generation failed:', error);
    
    // Fallback: simple colored circle
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="${primaryColor}" opacity="0.8"/>
  <circle cx="100" cy="100" r="60" fill="none" stroke="white" stroke-width="4"/>
</svg>`;
  }
}

/**
 * Generate CSS effects based on cosmetic properties
 */
export function generateCSSEffects(cosmetic: GeneratedCosmetic): {
  boxShadow?: string;
  border?: string;
  background?: string;
  filter?: string;
} {
  const effects: any = {};
  
  // Generate effects based on rarity
  switch (cosmetic.rarity) {
    case 'legendary':
      effects.boxShadow = `0 0 30px 10px ${cosmetic.color}CC, 0 0 60px 20px ${cosmetic.color}99`;
      effects.filter = 'brightness(1.2) saturate(1.3)';
      break;
      
    case 'epic':
      effects.boxShadow = `0 0 25px 8px ${cosmetic.color}BB, 0 0 50px 15px ${cosmetic.color}88`;
      effects.filter = 'brightness(1.15) saturate(1.2)';
      break;
      
    case 'rare':
      effects.boxShadow = `0 0 20px 5px ${cosmetic.color}AA, 0 0 40px 10px ${cosmetic.color}77`;
      break;
      
    case 'uncommon':
      effects.boxShadow = `0 0 15px 3px ${cosmetic.color}99`;
      break;
      
    case 'common':
      // No special effects for common
      break;
  }
  
  // Add border for certain positions
  if (cosmetic.position === 'aura' || cosmetic.position === 'background') {
    effects.border = `2px solid ${cosmetic.color}AA`;
  }
  
  // Add background gradient for background-type cosmetics
  if (cosmetic.position === 'background') {
    effects.background = `radial-gradient(circle at center, ${cosmetic.color}99 0%, ${cosmetic.color}44 50%, transparent 100%)`;
  }
  
  return effects;
}

/**
 * Calculate overlay position based on cosmetic position
 */
export function calculateOverlayPosition(position: string | undefined): {
  top?: string;
  left?: string;
  width?: string;
  height?: string;
  transform?: string;
} {
  switch (position) {
    case 'head':
      return {
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        height: 'auto',
      };
      
    case 'face':
      return {
        top: '35%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40%',
        height: 'auto',
      };
      
    case 'body':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        height: 'auto',
      };
      
    case 'background':
      return {
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      };
      
    case 'aura':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120%',
        height: '120%',
      };
      
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
      };
  }
}

/**
 * Batch generate multiple cosmetics
 */
export async function batchGenerateCosmetics(
  cosmetics: GeneratedCosmetic[]
): Promise<GeneratedCosmeticWithAssets[]> {
  const generated: GeneratedCosmeticWithAssets[] = [];
  
  for (const cosmetic of cosmetics) {
    try {
      const complete = await generateCompleteCosmetic(cosmetic);
      generated.push(complete);
      
      // Rate limiting delay (1 second between generations)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to generate cosmetic ${cosmetic.id}:`, error);
      
      // Add with fallback SVG
      generated.push({
        ...cosmetic,
        svgCode: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="${cosmetic.color || '#FFD700'}" opacity="0.8"/>
        </svg>`,
        cssEffects: {},
        overlayPosition: calculateOverlayPosition(cosmetic.position),
      });
    }
  }
  
  return generated;
}

/**
 * Save SVG to public directory (for production)
 */
export async function saveSVGToFile(
  cosmetic: GeneratedCosmeticWithAssets,
  publicDir: string
): Promise<string> {
  // This would typically use Node.js fs in a Cloud Function
  // For now, return data URL for inline use
  const base64 = Buffer.from(cosmetic.svgCode).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Convert SVG to data URL for inline embedding
 */
export function svgToDataURL(svgCode: string): string {
  const base64 = Buffer.from(svgCode).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Validate generated SVG
 */
export function validateSVG(svgCode: string): boolean {
  // Basic validation
  if (!svgCode.includes('<svg') || !svgCode.includes('</svg>')) {
    return false;
  }
  
  // Check for malicious content
  const dangerous = ['<script', 'javascript:', 'onerror=', 'onclick='];
  for (const pattern of dangerous) {
    if (svgCode.toLowerCase().includes(pattern)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Optimize SVG (remove unnecessary attributes)
 */
export function optimizeSVG(svgCode: string): string {
  return svgCode
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/>\s+</g, '><') // Remove space between tags
    .trim();
}

    