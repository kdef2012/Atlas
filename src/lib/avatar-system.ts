import type { Gender, SkillCategory } from './types';

export type BodyType = 'slim' | 'average' | 'athletic' | 'plus';
export type SkinTone = 'pale' | 'light' | 'medium' | 'tan' | 'deep' | 'dark';

export interface AvatarBase {
  gender: Gender;
  bodyType: BodyType;
  skinTone: SkinTone;
  style: string; // '1', '2', '3'
}

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'head' | 'face' | 'torso' | 'legs' | 'feet' | 'accessory' | 'aura';
  layer: number; // Rendering order (lower = rendered first)
  costGems?: number;
  requirement?: {
    type: 'quest' | 'level' | 'skill' | 'trait';
    value: string | number;
  };
  svgComponent?: string; // For now, we'll use simple shapes
}

// Skin tone hex colors
export const SKIN_TONES: Record<SkinTone, string> = {
  pale: '#FFE0BD',
  light: '#FFCD94',
  medium: '#EAC086',
  tan: '#C68642',
  deep: '#8D5524',
  dark: '#5C3317',
};

// Available cosmetic items
export const COSMETIC_ITEMS: CosmeticItem[] = [
  {
    id: 'newbie_sweatband',
    name: 'Newbie Sweatband',
    description: 'Your first step into ATLAS',
    type: 'head',
    layer: 10,
    requirement: { type: 'quest', value: 'first_log' },
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: 'Mysterious and powerful',
    type: 'torso',
    layer: 5,
    costGems: 100,
  },
  {
    id: 'arcane_goggles',
    name: 'Arcane Goggles',
    description: 'See beyond the mundane',
    type: 'face',
    layer: 12,
    costGems: 50,
  },
  {
    id: 'champion_pauldrons',
    name: 'Champion Pauldrons',
    description: 'Forged through victory',
    type: 'torso',
    layer: 8,
    costGems: 150,
  },
  {
    id: 'momentum_aura',
    name: 'Momentum Aura',
    description: 'The flame of dedication',
    type: 'aura',
    layer: 1,
    requirement: { type: 'trait', value: 'streaker' },
  },
];

// Get dominant skill category from user stats
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

  const max = entries.reduce((prev, current) => 
    current.value > prev.value ? current : prev
  );

  return max.category;
}

// Check if user is inactive (no log in 24 hours)
export function isUserInactive(lastLogTimestamp: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return (now - lastLogTimestamp) > twentyFourHours;
}

// Get evolution modifiers based on dominant skill
export function getEvolutionStyle(dominantSkill: SkillCategory): {
  posture: string;
  auraColor: string;
  expression: string;
} {
  switch (dominantSkill) {
    case 'Physical':
      return {
        posture: 'athletic',
        auraColor: '#ef4444', // red
        expression: 'determined',
      };
    case 'Mental':
      return {
        posture: 'focused',
        auraColor: '#3b82f6', // blue
        expression: 'intense',
      };
    case 'Social':
      return {
        posture: 'open',
        auraColor: '#a855f7', // purple
        expression: 'charismatic',
      };
    case 'Practical':
      return {
        posture: 'grounded',
        auraColor: '#22c55e', // green
        expression: 'confident',
      };
    case 'Creative':
      return {
        posture: 'expressive',
        auraColor: '#eab308', // yellow
        expression: 'inspired',
      };
  }
}
