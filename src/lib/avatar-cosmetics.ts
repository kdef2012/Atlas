
import type { User } from './types';

// Represents a single cosmetic item in the game
export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'effect' | 'background' | 'overlay' | 'animation';
  cssEffect?: string; // For CSS filter effects like drop-shadow, blur, etc.
  cssBackground?: string; // For background gradients or images
  animationClass?: string; // For CSS animation classes
  costGems?: number;
  requirement?: {
    type: 'quest' | 'level' | 'skill' | 'trait';
    value: string | number;
  };
}

// The master list of all available cosmetic items in the game.
export const COSMETIC_ITEMS: CosmeticItem[] = [
  {
    id: 'newbie_glow',
    name: 'Newbie Glow',
    description: 'Your first steps shine bright.',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))', // A soft green glow
    requirement: { type: 'level', value: 1 },
  },
   {
    id: 'newbie_border',
    name: 'Newbie Frame',
    description: 'A frame for new adventurers.',
    type: 'effect',
    cssEffect: 'border: 2px solid rgba(34, 197, 94, 0.5);', // A green border
    requirement: { type: 'level', value: 1 },
  },
  {
    id: 'shadow_aura',
    name: 'Shadow Aura',
    description: 'Embrace the darkness.',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))', // Purple glow
    costGems: 100,
  },
  {
    id: 'champion_aura',
    name: 'Champion Aura',
    description: 'The mark of greatness.',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.9))', // Gold glow
    costGems: 150,
  },
  {
    id: 'fire_background',
    name: 'Flames of Momentum',
    description: 'Burning with determination.',
    type: 'background',
    cssBackground: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
    requirement: { type: 'trait', value: 'streaker' },
  },
];

/**
 * Returns a list of active cosmetic items based on the user's avatarLayers.
 * @param avatarLayers - The user's record of active cosmetic layers.
 * @returns An array of active CosmeticItem objects.
 */
export function getActiveCosmetics(avatarLayers?: Partial<Record<string, boolean>>): CosmeticItem[] {
  if (!avatarLayers) {
    return [];
  }

  const activeLayerIds = Object.keys(avatarLayers).filter(key => avatarLayers[key]);
  
  return COSMETIC_ITEMS.filter(item => activeLayerIds.includes(item.id));
}


/**
 * Represents the combined visual effects from multiple cosmetics.
 */
interface CombinedEffects {
  filter: string;
  background: string;
  border: string;
  animationClasses: string[];
}

/**
 * Combines the CSS effects from a list of active cosmetic items.
 * @param activeCosmetics - An array of active CosmeticItem objects.
 * @returns An object containing combined CSS strings for styling.
 */
export function combineCosmeticEffects(activeCosmetics: CosmeticItem[]): CombinedEffects {
  const effects = activeCosmetics.reduce<CombinedEffects>((acc, item) => {
    if (item.type === 'effect' && item.cssEffect) {
      if (item.cssEffect.startsWith('border:')) {
          acc.border = item.cssEffect;
      } else {
        acc.filter += ` ${item.cssEffect}`;
      }
    }
    if (item.type === 'background' && item.cssBackground) {
      acc.background = acc.background ? `${acc.background}, ${item.cssBackground}` : item.cssBackground;
    }
    if (item.type === 'animation' && item.animationClass) {
        acc.animationClasses.push(item.animationClass);
    }
    return acc;
  }, { filter: '', background: '', border: '', animationClasses: [] });

  // Trim leading/trailing whitespace
  effects.filter = effects.filter.trim();
  
  return effects;
}
