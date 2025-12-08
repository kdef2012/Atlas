import type { SkillCategory } from './types';

// Cosmetic items for Ready Player Me avatars
export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'glow' | 'aura' | 'background' | 'border' | 'url-mod';
  
  // Visual effects (applied to container)
  boxShadow?: string;
  border?: string;
  backgroundGradient?: string;
  animationClass?: string;
  
  // URL modifications (applied to avatar URL)
  urlModifications?: {
    textureAtlas?: number;      // 256, 512, 1024, 2048
    morphTargets?: string[];    // ['ARKit', 'Oculus', etc]
    lod?: number;               // 0 (high), 1 (med), 2 (low)
    pose?: 'A' | 'T';          // A-pose or T-pose
  };
  
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
  
  // ===== URL MODIFICATIONS (FREE & INSTANT!) =====
  {
    id: 'performance_mode',
    name: 'Performance Mode',
    description: 'Faster loading with lower quality textures',
    type: 'url-mod',
    urlModifications: {
      textureAtlas: 512,
      lod: 2,
    },
    costGems: 0, // Free for everyone!
  },
  {
    id: 'balanced_mode',
    name: 'Balanced Quality',
    description: 'Good balance of quality and performance',
    type: 'url-mod',
    urlModifications: {
      textureAtlas: 1024,
      lod: 1,
    },
    costGems: 0, // Free!
  },
  {
    id: 'ultra_quality',
    name: 'Ultra HD Mode',
    description: 'Maximum quality rendering for your avatar',
    type: 'url-mod',
    urlModifications: {
      textureAtlas: 2048,
      lod: 0,
    },
    costGems: 50,
  },
  {
    id: 'expressive_mode',
    name: 'Expressive Face',
    description: 'Enable advanced facial expression support',
    type: 'url-mod',
    urlModifications: {
      morphTargets: ['ARKit', 'Oculus'],
    },
    costGems: 75,
  },
  {
    id: 'a_pose',
    name: 'Power Stance',
    description: 'Display your avatar in an A-pose',
    type: 'url-mod',
    urlModifications: {
      pose: 'A',
    },
    costGems: 25,
  },
  {
    id: 't_pose',
    name: 'T-Pose Dominance',
    description: 'Assert dominance with the classic T-pose',
    type: 'url-mod',
    urlModifications: {
      pose: 'T',
    },
    costGems: 25,
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
  {
    id: 'rainbow_glow',
    name: 'Prismatic Glow',
    description: 'All colors of achievement',
    type: 'glow',
    boxShadow: '0 0 20px 5px rgba(168, 85, 247, 0.6), 0 0 40px 10px rgba(251, 191, 36, 0.6)',
    costGems: 200,
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
  {
    id: 'gold_background',
    name: 'Golden Radiance',
    description: 'Bathed in success',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 70%)',
    requirement: { type: 'level', value: 10 },
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
  {
    id: 'crimson_border',
    name: 'Crimson Edge',
    description: 'Bold and powerful',
    type: 'border',
    border: '4px solid rgba(239, 68, 68, 0.9)',
    costGems: 100,
  },
];

// Helper to get active cosmetics
export function getActiveCosmetics(avatarLayers?: Record<string, boolean>): CosmeticItem[] {
  if (!avatarLayers) return [];
  
  return COSMETIC_ITEMS.filter(item => avatarLayers[item.id] === true);
}

// Build avatar URL with all URL modifications
export function buildAvatarUrl(baseUrl: string, cosmetics: CosmeticItem[]): string {
  const urlMods = cosmetics.filter(c => c.type === 'url-mod' && c.urlModifications);
  
  if (urlMods.length === 0) return baseUrl;
  
  const params = new URLSearchParams();
  const morphTargets: string[] = [];
  let textureAtlas: number | undefined;
  let lod: number | undefined;
  let pose: string | undefined;
  
  // Combine all URL modifications
  urlMods.forEach(mod => {
    if (mod.urlModifications?.morphTargets) {
      morphTargets.push(...mod.urlModifications.morphTargets);
    }
    if (mod.urlModifications?.textureAtlas !== undefined) {
      // Use highest quality requested
      textureAtlas = Math.max(textureAtlas || 0, mod.urlModifications.textureAtlas);
    }
    if (mod.urlModifications?.lod !== undefined) {
      // Use lowest LOD (highest quality)
      lod = Math.min(lod ?? 2, mod.urlModifications.lod);
    }
    if (mod.urlModifications?.pose) {
      pose = mod.urlModifications.pose;
    }
  });
  
  // Build query string
  if (morphTargets.length > 0) {
    params.set('morphTargets', [...new Set(morphTargets)].join(','));
  }
  if (textureAtlas !== undefined) {
    params.set('textureAtlas', textureAtlas.toString());
  }
  if (lod !== undefined) {
    params.set('lod', lod.toString());
  }
  if (pose) {
    params.set('pose', pose);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// Helper to combine visual effects (non-URL cosmetics)
export function combineCosmeticEffects(cosmetics: CosmeticItem[]): {
  boxShadow: string;
  background: string;
  border: string;
  animationClasses: string[];
} {
  const boxShadows: string[] = [];
  const backgrounds: string[] = [];
  let border = '';
  const animationClasses: string[] = [];
  
  cosmetics.forEach(cosmetic => {
    // Glows and auras
    if ((cosmetic.type === 'glow' || cosmetic.type === 'aura') && cosmetic.boxShadow) {
      boxShadows.push(cosmetic.boxShadow);
    }
    
    // Backgrounds
    if (cosmetic.type === 'background' && cosmetic.backgroundGradient) {
      backgrounds.push(cosmetic.backgroundGradient);
    }
    
    // Borders (only use the last one applied)
    if (cosmetic.type === 'border' && cosmetic.border) {
      border = cosmetic.border;
    }
    
    // Animations
    if (cosmetic.animationClass) {
      animationClasses.push(cosmetic.animationClass);
    }
  });
  
  return {
    boxShadow: boxShadows.join(', ') || 'none',
    background: backgrounds.join(', ') || 'transparent',
    border,
    animationClasses,
  };
}

// Utility functions
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
