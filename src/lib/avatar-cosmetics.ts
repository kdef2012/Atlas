
import type { SkillCategory, CosmeticItem } from './types';

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
  
  // ===== STORE ITEMS (NOW DEFINED HERE) =====
  {
      "id": "cosmetic_shadow_cloak",
      "name": "Shadow Cloak",
      "description": "A mysterious cloak that billows with ethereal energy.",
      "type": "overlay",
      "imageUrl": "https://firebasestorage.googleapis.com/v0/b/owl-about-that-9f67d.appspot.com/o/assets%2Fshadow_cloak.png?alt=media&token=7e750e3a-0e9e-4e42-921c-529a73841a0b",
      "costGems": 10
  },
  {
      "id": "cosmetic_arcane_goggles",
      "name": "Arcane Goggles",
      "description": "Lenses crafted to see the flow of raw data in the world.",
      "type": "overlay",
      "imageUrl": "https://firebasestorage.googleapis.com/v0/b/owl-about-that-9f67d.appspot.com/o/assets%2Farcane_goggles.png?alt=media&token=e1c6999a-3f9c-48b4-8250-93217b189736",
      "costGems": 8
  },
  {
      "id": "cosmetic_titans_pauldrons",
      "name": "Titan's Pauldrons",
      "description": "Heavy shoulder plates, signifying immense physical power.",
      "type": "overlay",
      "imageUrl": "https://firebasestorage.googleapis.com/v0/b/owl-about-that-9f67d.appspot.com/o/assets%2Ftitans_pauldrons.png?alt=media&token=f6c4c5b3-3a8a-48a5-9a84-0a4a9c3d4a6e",
      "costGems": 12
  },

  // ===== URL MODIFICATIONS =====
  {
    id: 'performance_mode',
    name: 'Performance Mode',
    description: 'Faster loading with lower quality textures',
    type: 'url-mod',
    urlModifications: {
      textureAtlas: 512,
      lod: 2,
    },
    costGems: 0,
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
    costGems: 0,
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
  
  // ===== BACKGROUNDS (NOW WORK WITH TRANSPARENT AVATAR!) =====
  {
    id: 'fire_background',
    name: 'Inferno Backdrop',
    description: 'Surrounded by flames',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.9) 0%, rgba(239, 68, 68, 0.7) 50%, rgba(120, 30, 30, 0.5) 100%)',
    requirement: { type: 'trait', value: 'streaker' },
  },
  {
    id: 'starfield_background',
    name: 'Cosmic Backdrop',
    description: 'Among the stars',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.9) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.9) 0%, transparent 40%), linear-gradient(180deg, rgba(10, 10, 50, 1) 0%, rgba(0, 0, 20, 1) 100%)',
    costGems: 150,
  },
  {
    id: 'matrix_background',
    name: 'Digital Rain',
    description: 'Enter the matrix',
    type: 'background',
    backgroundGradient: 'linear-gradient(0deg, rgba(0, 255, 65, 0.8) 0%, rgba(0, 100, 30, 0.9) 100%)',
    costGems: 200,
  },
  {
    id: 'gold_background',
    name: 'Golden Radiance',
    description: 'Bathed in success',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at center, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0.8) 50%, rgba(180, 100, 0, 0.6) 100%)',
    requirement: { type: 'level', value: 10 },
  },
  {
    id: 'ice_background',
    name: 'Frozen Tundra',
    description: 'Cold and calculated',
    type: 'background',
    backgroundGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 197, 253, 0.9) 50%, rgba(191, 219, 254, 0.8) 100%)',
    costGems: 150,
  },
  {
    id: 'shadow_background',
    name: 'Shadow Realm',
    description: 'Darkness embraces you',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at center, rgba(88, 28, 135, 0.9) 0%, rgba(49, 46, 129, 0.95) 50%, rgba(17, 24, 39, 1) 100%)',
    costGems: 175,
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

export function getActiveCosmetics(avatarLayers?: Record<string, boolean>): CosmeticItem[] {
  if (!avatarLayers) return [];
  return COSMETIC_ITEMS.filter(item => avatarLayers[item.id] === true);
}

export function buildAvatarUrl(
  baseUrl: string, 
  cosmetics: CosmeticItem[]
): string {
  const urlMods = cosmetics.filter(c => c.type === 'url-mod' && c.urlModifications);
  
  // Use URLSearchParams to handle URL construction safely
  const url = new URL(baseUrl);
  const params = url.searchParams;
  
  const morphTargets: string[] = [];
  let textureAtlas: number | undefined;
  let lod: number | undefined;
  let pose: string | undefined;
  
  urlMods.forEach(mod => {
    if (mod.urlModifications?.morphTargets) {
      morphTargets.push(...mod.urlModifications.morphTargets);
    }
    if (mod.urlModifications?.textureAtlas !== undefined) {
      textureAtlas = Math.max(textureAtlas || 0, mod.urlModifications.textureAtlas);
    }
    if (mod.urlModifications?.lod !== undefined) {
      lod = Math.min(lod ?? 2, mod.urlModifications.lod);
    }
    if (mod.urlModifications?.pose) {
      pose = mod.urlModifications.pose;
    }
  });
  
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
  
  return url.toString();
}

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
    if ((cosmetic.type === 'glow' || cosmetic.type === 'aura') && cosmetic.boxShadow) {
      boxShadows.push(cosmetic.boxShadow);
    }
    
    if (cosmetic.type === 'background' && cosmetic.backgroundGradient) {
      backgrounds.push(cosmetic.backgroundGradient);
    }
    
    if (cosmetic.type === 'border' && cosmetic.border) {
      border = cosmetic.border;
    }
    
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
