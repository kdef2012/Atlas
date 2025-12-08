
import type { Gender, SkillCategory } from './types';

// Open Peeps customization options
export interface OpenPeepsConfig {
  // Core identity
  gender: Gender;
  skinTone: SkinTone;
  
  // Body & Pose
  body: BodyPose;
  
  // Head & Face
  head: HeadShape;
  eyes: EyeStyle;
  eyebrows: EyebrowStyle;
  mouth: MouthStyle;
  
  // Hair
  hair: HairStyle;
  hairColor: HairColor;
  
  // Accessories (optional)
  facialHair?: FacialHairStyle; // Male only
  accessories?: AccessoryType[];
}

// Skin tones
export type SkinTone = 'light' | 'yellow' | 'brown' | 'dark' | 'red' | 'black';

export const SKIN_TONE_COLORS: Record<SkinTone, string> = {
  light: '#FFDBB4',
  yellow: '#EDB98A',
  brown: '#D08B5B',
  dark: '#AE5D29',
  red: '#8D5524',
  black: '#614335',
};

// Body poses
export type BodyPose = 
  | 'standing' 
  | 'sitting' 
  | 'arms-crossed'
  | 'hands-in-pockets'
  | 'pointing';

// Head shapes
export type HeadShape = 'default' | 'round' | 'square' | 'long';

// Eye styles
export type EyeStyle = 
  | 'normal'
  | 'happy'
  | 'content'
  | 'squint'
  | 'simple'
  | 'dizzy'
  | 'wink'
  | 'hearts';

// Eyebrow styles
export type EyebrowStyle = 
  | 'up'
  | 'down'
  | 'eyelashesUp'
  | 'eyelashesDown'
  | 'left'
  | 'leftLowered';

// Mouth styles
export type MouthStyle = 
  | 'frown'
  | 'lips'
  | 'nervous'
  | 'pucker'
  | 'sad'
  | 'smile'
  | 'smirk'
  | 'surprised';

// Hair styles
export type HairStyle = 
  | 'none'
  | 'long1'
  | 'long2'
  | 'short1'
  | 'short2'
  | 'short3'
  | 'bun'
  | 'curly'
  | 'dreads'
  | 'afro';

// Hair colors
export type HairColor = 
  | 'black'
  | 'brown'
  | 'blonde'
  | 'red'
  | 'gray'
  | 'blue'
  | 'pink';

export const HAIR_COLOR_VALUES: Record<HairColor, string> = {
  black: '#2C1B18',
  brown: '#724133',
  blonde: '#F59E42',
  red: '#D2524A',
  gray: '#B3B3B3',
  blue: '#4A90E2',
  pink: '#E91E63',
};

// Facial hair (male only)
export type FacialHairStyle = 
  | 'none'
  | 'stubble'
  | 'mediumBeard'
  | 'goatee';

// Accessories
export type AccessoryType = 
  | 'glasses'
  | 'sunglasses'
  | 'hat'
  | 'mask';

// Encode config to string for storage
export function encodeAvatarConfig(config: OpenPeepsConfig): string {
  return JSON.stringify(config);
}

// Decode config from string
export function decodeAvatarConfig(encoded: string): OpenPeepsConfig | null {
  try {
    return JSON.parse(encoded);
  } catch {
    return null;
  }
}

// Get dominant skill
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

// Check if user is inactive
export function isUserInactive(lastLogTimestamp: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return (now - lastLogTimestamp) > twentyFourHours;
}

// Evolution effects (for later hybrid approach)
export interface EvolutionEffect {
  borderColor: string;
  glowColor: string;
  badgeText: string;
  auraEffect?: 'fire' | 'lightning' | 'sparkles' | 'glow' | 'shadow';
  poseMod?: 'confident' | 'focused' | 'relaxed' | 'energetic';
}

export function getEvolutionEffect(dominantSkill: SkillCategory): EvolutionEffect {
  switch (dominantSkill) {
    case 'Physical':
      return {
        borderColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.4)',
        badgeText: '💪 Titan',
        auraEffect: 'fire',
        poseMod: 'energetic',
      };
    case 'Mental':
      return {
        borderColor: '#3b82f6',
        glowColor: 'rgba(59, 130, 246, 0.4)',
        badgeText: '🧠 Sage',
        auraEffect: 'glow',
        poseMod: 'focused',
      };
    case 'Social':
      return {
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.4)',
        badgeText: '🤝 Leader',
        auraEffect: 'sparkles',
        poseMod: 'confident',
      };
    case 'Practical':
      return {
        borderColor: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.4)',
        badgeText: '🔧 Builder',
        auraEffect: 'lightning',
        poseMod: 'confident',
      };
    case 'Creative':
      return {
        borderColor: '#eab308',
        glowColor: 'rgba(234, 179, 8, 0.4)',
        badgeText: '🎨 Artist',
        auraEffect: 'sparkles',
        poseMod: 'relaxed',
      };
  }
}

// Preset configurations for quick selection
export const PRESET_CONFIGS: Record<string, Partial<OpenPeepsConfig>> = {
  athletic_female: {
    gender: 'Female',
    body: 'arms-crossed',
    eyes: 'content',
    eyebrows: 'up',
    mouth: 'smile',
    hair: 'short2',
  },
  casual_male: {
    gender: 'Male',
    body: 'hands-in-pockets',
    eyes: 'normal',
    eyebrows: 'up',
    mouth: 'smile',
    hair: 'short1',
    facialHair: 'stubble',
  },
  professional_female: {
    gender: 'Female',
    body: 'standing',
    eyes: 'normal',
    eyebrows: 'up',
    mouth: 'lips',
    hair: 'bun',
    accessories: ['glasses'],
  },
};

// Cosmetic items (for the wardrobe system)
export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'effect' | 'background' | 'overlay';
  cssEffect?: string; // For CSS-based effects
  imageUrl?: string; // For image overlays (future AI-generated)
  costGems?: number;
  requirement?: {
    type: 'quest' | 'level' | 'skill' | 'trait';
    value: string | number;
  };
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  {
    id: 'newbie_glow',
    name: 'Newbie Glow',
    description: 'Your first steps shine bright',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))',
    requirement: { type: 'level', value: 1 },
  },
  {
    id: 'shadow_aura',
    name: 'Shadow Aura',
    description: 'Embrace the darkness',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))',
    costGems: 100,
  },
  {
    id: 'champion_aura',
    name: 'Champion Aura',
    description: 'The mark of greatness',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.9))',
    costGems: 150,
  },
  {
    id: 'fire_background',
    name: 'Flames of Momentum',
    description: 'Burning with determination',
    type: 'background',
    cssEffect: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
    requirement: { type: 'trait', value: 'streaker' },
  },
  {
    id: 'ice_aura',
    name: 'Frozen Focus',
    description: 'Cool, calm, collected',
    type: 'effect',
    cssEffect: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.7))',
    costGems: 100,
  },
];
