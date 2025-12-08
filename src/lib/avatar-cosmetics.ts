import type { SkillCategory } from './types';

// Cosmetic items for Ready Player Me avatars
export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'glow' | 'aura' | 'background' | 'overlay' | 'border' | 'particle';
  cssEffect?: string;
  boxShadow?: string; // NEW: Use box-shadow instead of filter for glows
  backgroundGradient?: string;
  animationClass?: string;
  costGems?: number;
  requirement?: {
    type: 'quest' | 'level' | 'skill' | 'trait' | 'starter';
    value: string | number;
  };
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // STARTER ITEMS (Free/Quest Rewards)
  {
    id: 'newbie_glow',
    name: 'Newbie Glow',
    description: 'Your first steps shine bright',
    type: 'glow',
    boxShadow: '0 0 20px 5px rgba(34, 197, 94, 0.6), 0 0 40px 10px rgba(34, 197, 94, 0.4)', // GREEN GLOW
    requirement: { type: 'starter', value: 1 },
  },
  {
    id: 'newbie_border',
    name: 'Newbie Frame',
    description: 'A fresh start',
    type: 'border',
    cssEffect: '3px solid rgba(34, 197, 94, 0.6)',
    requirement: { type: 'starter', value: 1 },
  },
  
  // MORE COSMETICS
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
  {
    id: 'fire_background',
    name: 'Inferno Background',
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
    if (cosmetic.type === 'border' && cosmetic.cssEffect) {
      border = cosmetic.cssEffect;
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

// Keep these utility functions
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
