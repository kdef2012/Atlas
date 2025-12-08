import type { SkillCategory } from './types';

// Cosmetic items for Ready Player Me avatars
export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'glow' | 'aura' | 'background' | 'overlay' | 'border' | 'particle';
  cssEffect?: string;
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
    cssEffect: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))',
    requirement: { type: 'starter', value: 1 },
  },
  {
    id: 'newbie_border',
    name: 'Newbie Frame',
    description: 'A fresh start',
    type: 'border',
    cssEffect: 'border: 3px solid rgba(34, 197, 94, 0.6)',
    requirement: { type: 'starter', value: 1 },
  },
  
  // MORE COSMETICS
  {
    id: 'shadow_aura',
    name: 'Shadow Aura',
    description: 'Embrace the darkness',
    type: 'aura',
    cssEffect: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))',
    costGems: 100,
  },
  {
    id: 'champion_aura',
    name: 'Champion Aura',
    description: 'The mark of greatness',
    type: 'aura',
    cssEffect: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.9))',
    costGems: 150,
  },
  {
    id: 'fire_background',
    name: 'Inferno Background',
    description: 'Surrounded by flames',
    type: 'background',
    backgroundGradient: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.4) 0%, rgba(239, 68, 68, 0.2) 40%, transparent 70%)',
    requirement: { type: 'trait', value: 'streaker' },
  },
];

// Helper to get active cosmetics
export function getActiveCosmetics(avatarLayers?: Record<string, boolean>): CosmeticItem[] {
  if (!avatarLayers) return [];
  
  return COSMETIC_ITEMS.filter(item => avatarLayers[item.id] === true);
}

// Helper to combine CSS effects
export function combineCosmeticEffects(cosmetics: CosmeticItem[]): {
  filter: string;
  background: string;
  border: string;
  animationClasses: string[];
} {
  const filters: string[] = [];
  const backgrounds: string[] = [];
  let border = '';
  const animationClasses: string[] = [];
  
  cosmetics.forEach(cosmetic => {
    if (cosmetic.type === 'glow' || cosmetic.type === 'aura') {
      if (cosmetic.cssEffect) filters.push(cosmetic.cssEffect);
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
    filter: filters.join(' ') || 'none',
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
