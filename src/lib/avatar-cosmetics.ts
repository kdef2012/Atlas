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
