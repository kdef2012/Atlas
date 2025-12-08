import type { SkillCategory } from './types';

// Cosmetic items for Ready Player Me avatars
export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'glow' | 'aura' | 'background' | 'overlay' | 'border' | 'particle' | 'hat' | 'accessory';
  
  // Visual effects
  boxShadow?: string;           // For glows/auras
  border?: string;              // For borders/frames
  backgroundGradient?: string;  // For background effects
  backgroundImage?: string;     // For image backgrounds
  overlayImage?: string;        // For hats, accessories, etc (PNG with transparency)
  overlayPosition?: {           // Position of overlay relative to avatar
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
    width?: string;
    height?: string;
    zIndex?: number;
  };
  
  animationClass?: string;
  costGems?: number;
  requirement?: {
    type: 'quest' | 'level' | 'skill' | 'trait' | 'starter';
    value: string | number;
  };
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // ===== STARTER ITEMS =====
  {
    id: 'newbie_glow',
    name: 'Newbie Glow',
    description: 'Your first steps shine bright',
    type: 'glow',
    boxShadow: '0 0 20px 5px rgba(34, 197, 94, 0.6), 0 0 40px 10px rgba(34, 197, 94, 0.4)',
    requirement: { type: 'starter', value: 1 },
  },
  {
    id: 'newbie_border',
    name: 'Newbie Frame',
    description: 'A fresh start',
    type: 'border',
    border: '3px solid rgba(34, 197, 94, 0.6)',
    requirement: { type: 'starter', value: 1 },
  },
  
  // ===== GLOWS & AURAS =====
  {
    id: 'shadow_aura',
    name: 'Shadow Aura',
    description: 'Embrace the darkness',
    type: 'aura',
    boxShadow: '0 0 25px 8px rgba(139, 92, 246, 0.8), 0 0 50px 15px rgba(139, 92, 246, 0.5)',
    costGems: 100,
  },
  {
    id: 'champion_aura',
    name: 'Champion Aura',
    description: 'The mark of greatness',
    type: 'aura',
    boxShadow: '0 0 30px 10px rgba(251, 191, 36, 0.9), 0 0 60px 20px rgba(251, 191, 36, 0.6)',
    costGems: 150,
  },
  {
    id: 'ice_aura',
    name: 'Frozen Focus',
    description: 'Cool, calm, collected',
    type: 'aura',
    boxShadow: '0 0 20px 6px rgba(59, 130, 246, 0.7), 0 0 40px 12px rgba(59, 130, 246, 0.4)',
    costGems: 100,
  },
  {
    id: 'fire_aura',
    name: 'Flames of Determination',
    description: 'Burning with passion',
    type: 'aura',
    boxShadow: '0 0 25px 8px rgba(249, 115, 22, 0.8), 0 0 50px 15px rgba(239, 68, 68, 0.5)',
    requirement: { type: 'trait', value: 'streaker' },
  },
  
  // ===== BACKGROUNDS =====
  {
    id: 'fire_background',
    name: 'Inferno Backdrop',
    description: 'Surrounded by flames',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 70%)',
    requirement: { type: 'trait', value: 'streaker' },
  },
  {
    id: 'starfield_background',
    name: 'Cosmic Backdrop',
    description: 'Among the stars',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
    costGems: 150,
  },
  {
    id: 'matrix_background',
    name: 'Digital Rain',
    description: 'Enter the matrix',
    type: 'background',
    backgroundGradient: 'linear-gradient(0deg, rgba(0, 255, 65, 0.1) 0%, transparent 100%)',
    costGems: 200,
  },
  
  // ===== HATS & ACCESSORIES (Placeholder - you'll add real images) =====
  {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    description: 'Master of the arcane',
    type: 'hat',
    overlayImage: '/cosmetics/wizard-hat.png', // You'll create this
    overlayPosition: {
      top: '-10%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      zIndex: 10,
    },
    costGems: 250,
  },
  {
    id: 'crown',
    name: 'Golden Crown',
    description: 'Royalty recognized',
    type: 'hat',
    overlayImage: '/cosmetics/crown.png',
    overlayPosition: {
      top: '-5%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50%',
      zIndex: 10,
    },
    requirement: { type: 'level', value: 25 },
  },
  {
    id: 'halo',
    name: 'Divine Halo',
    description: 'Blessed by the gods',
    type: 'accessory',
    overlayImage: '/cosmetics/halo.png',
    overlayPosition: {
      top: '-15%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      zIndex: 5,
    },
    costGems: 300,
  },
  {
    id: 'sunglasses',
    name: 'Cool Shades',
    description: 'Too cool for school',
    type: 'accessory',
    overlayImage: '/cosmetics/sunglasses.png',
    overlayPosition: {
      top: '35%', // Adjust based on where face is
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40%',
      zIndex: 15,
    },
    costGems: 150,
  },
  
  // ===== BORDERS & FRAMES =====
  {
    id: 'legendary_border',
    name: 'Legendary Frame',
    description: 'Only for the elite',
    type: 'border',
    border: '4px solid rgba(251, 191, 36, 0.9)',
    requirement: { type: 'level', value: 25 },
  },
  {
    id: 'neon_border',
    name: 'Neon Frame',
    description: 'Electric energy',
    type: 'border',
    border: '3px solid rgba(34, 211, 238, 0.8)',
    animationClass: 'animate-pulse',
    costGems: 125,
  },
];

// Helper to get active cosmetics
export function getActiveCosmetics(avatarLayers?: Record<string, boolean>): CosmeticItem[] {
  if (!avatarLayers) return [];
  
  return COSMETIC_ITEMS.filter(item => avatarLayers[item.id] === true);
}

// Helper to combine CSS effects
export function combineCosmeticEffects(cosmetics: CosmeticItem[]): {
  boxShadow: string;
  background: string;
  border: string;
  animationClasses: string[];
  overlays: CosmeticItem[]; // Items that need to be rendered as overlays
} {
  const boxShadows: string[] = [];
  const backgrounds: string[] = [];
  let border = '';
  const animationClasses: string[] = [];
  const overlays: CosmeticItem[] = [];
  
  cosmetics.forEach(cosmetic => {
    // Glows and auras
    if ((cosmetic.type === 'glow' || cosmetic.type === 'aura') && cosmetic.boxShadow) {
      boxShadows.push(cosmetic.boxShadow);
    }
    
    // Backgrounds
    if (cosmetic.type === 'background') {
      if (cosmetic.backgroundGradient) {
        backgrounds.push(cosmetic.backgroundGradient);
      }
      if (cosmetic.backgroundImage) {
        backgrounds.push(`url(${cosmetic.backgroundImage})`);
      }
    }
    
    // Borders
    if (cosmetic.type === 'border' && cosmetic.border) {
      border = cosmetic.border;
    }
    
    // Animations
    if (cosmetic.animationClass) {
      animationClasses.push(cosmetic.animationClass);
    }
    
    // Overlays (hats, accessories)
    if ((cosmetic.type === 'hat' || cosmetic.type === 'accessory' || cosmetic.type === 'overlay') 
        && cosmetic.overlayImage) {
      overlays.push(cosmetic);
    }
  });
  
  return {
    boxShadow: boxShadows.join(', ') || 'none',
    background: backgrounds.join(', ') || 'transparent',
    border,
    animationClasses,
    overlays,
  };
}

// Keep utility functions
export function getDominantSkill(stats: {
  physicalStat: number;
  mentalStat: number;
  socialStat: number;
  practicalStat: number;
  creativeStat: number;
}): SkillCategory {
  const entries = [
    { category: 'Physical' as SkillCategory, value: stats.physicalStat },
    { category: 'Mental' as SkillCategory, value: stats.mentalStat },
    { category: 'Social' as SkillCategory, value: stats.socialStat },
    { category: 'Practical' as SkillCategory, value: stats.practicalStat },
    { category: 'Creative' as SkillCategory, value: stats.creativeStat },
  ];

  return entries.reduce((prev, current) => 
    current.value > prev.value ? current : prev
  ).category;
}

export function isUserInactive(lastLogTimestamp: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return (now - lastLogTimestamp) > twentyFourHours;
}
