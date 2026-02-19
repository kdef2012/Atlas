
import { Dumbbell, BrainCircuit, Users, Wrench, Paintbrush, Swords, Flame, Gem, ShieldCheck, Crown, Lightbulb, Star, Award, HeartHandshake, Building2, Trophy, Store, Moon, Sunrise, Crosshair, Sparkles, Zap, Handshake, PersonStanding, BookOpen, MessageSquare, Megaphone, Radio, Glasses, RectangleHorizontal, Shield, Shirt } from 'lucide-react';
import type { GeneratedCosmetic as BaseGeneratedCosmetic, EvolutionPathData } from './ai/activity-analyzer';

// We redefine the UI-specific fields to be compatible with React's style objects
export interface GeneratedCosmetic extends Omit<BaseGeneratedCosmetic, 'cssEffects'> {
  svgCode: string; 
  color: string;
  position: 'head' | 'face' | 'body' | 'background' | 'aura';
  cssEffects?: {
    boxShadow?: string;
    border?: string;
    background?: string;
    filter?: string;
    [key: string]: string | number | undefined; 
  };
  overlayPosition?: {
    top?: string;
    left?: string;
    width?: string;
    height?: string;
    transform?: string;
  };
}

export type Archetype = 'Titan' | 'Sage' | 'Maverick';
export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';
export type Gender = 'Male' | 'Female';
export type AvatarStyle = string;
export type CosmeticPosition = 'head' | 'face' | 'body' | 'background' | 'aura';

export interface UserSkillData {
  isUnlocked: boolean;
  xp: number;
}

export interface User {
  id: string;
  archetype: Archetype;
  email: string | null;
  userName: string;
  gender?: Gender;
  avatarStyle?: AvatarStyle;
  avatarUrl?: string;
  baseAvatarUrl?: string;
  physicalStat: number;
  mentalStat: number;
  socialStat: number;
  practicalStat: number;
  creativeStat: number;
  lastLogTimestamp: number;
  createdAt: number;
  level: number;
  xp: number;
  fireteamId?: string;
  guilds?: Record<string, boolean>;
  userSkills: Record<string, UserSkillData>;
  avatarLayers?: Record<string, boolean>; 
  ownedCosmetics?: Record<string, boolean>;
  momentumFlameActive: boolean;
  gems: number;
  streakFreezes: number;
  traits?: Record<string, boolean>;
  verificationVotes?: number;
  failedVerificationCount?: number; // Tracks rejected logs
  region?: string;
  aiGeneratedCosmetics?: Record<string, GeneratedCosmetic>;
  suggestedCosmetics?: GeneratedCosmetic[];
  evolutionPath?: EvolutionPathData;
  evolutionLevel?: number;
  hasPaidAccess?: boolean; // True if account activation fee is paid
}

export interface SavedAvatar {
  id: string; // The stable signature
  avatarUrl: string;
  equippedLayers: Record<string, boolean>;
  createdAt: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  xp: number;
  pioneerUserId: string;
  prerequisites: string[];
  cost: {
    category: SkillCategory;
    points: number;
  };
  innovatorAwarded: boolean;
  isApproved: boolean; // True if validated by community/admin
}

export interface Log {
  id: string;
  userId: string;
  skillId: string;
  timestamp: number;
  xp: number;
  verificationPhotoUrl?: string;
  isVerified: boolean;
}

export interface Fireteam {
  id: string;
  name: string;
  region: string;
  state: string;
  country: string;
  ownerId: string;
  members: Record<string, boolean>;
  streakActive: boolean;
  streakStartDate: number;
}

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  userId: string;
  userName: string;
  channel: string;
}

export interface Guild {
  id: string;
  name: string;
  skillId: string;
  category: SkillCategory;
  region: string;
  members: Record<string, boolean>;
  challengeGoal: number;
  challengeProgress: number;
  challengeEndsAt: number;
  isBuffActive: boolean;
}

export interface Territory {
  id: string;
  faction: SkillCategory;
  challengeDescription: string;
  endsAt: number;
  scores: Record<string, number>;
  awarded: boolean;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof TRAIT_ICONS;
}

export interface GlobalEvent {
  id: string;
  title: string;
  description: string;
  startAt: number;
  endAt: number;
  xpMultiplier?: number;
  isActive: boolean;
  bannerMessage?: string;
  hasBanner: boolean;
}

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  visualDescription: string;
  type: 'glow' | 'aura' | 'background' | 'border' | 'url-mod' | 'overlay';
  position?: CosmeticPosition;
  imageUrl?: string;
  
  boxShadow?: string;
  border?: string;
  backgroundGradient?: string;
  animationClass?: string;
  
  urlModifications?: {
    textureAtlas?: number;
    morphTargets?: string[];
    lod?: number;
    pose?: 'A' | 'T';
  };
  
  costGems?: number;
  requirement?: {
    type: 'quest' | 'level' | 'skill' | 'trait' | 'starter';
    value: string | number;
  };
}


export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: keyof typeof STORE_ITEM_ICONS;
  layerKey: string;
  visualDescription: string;
  // Prestige Gate Fields
  minLevel?: number;
  requiredTraitId?: string;
}

export interface PublicLog {
  skillName: string;
  category: SkillCategory;
  userRegion: string;
  timestamp: number;
  id?: string; // from useCollection
}

export interface AtlasRadioBroadcast {
  id: string;
  timestamp: number;
  script: string;
  audioUrl: string;
}

export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  skillId: string;
  status: 'pending' | 'active' | 'completed' | 'denied';
  createdAt: number;
  startedAt?: number;
}


export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Physical: 'hsl(var(--chart-1))',
  Mental: 'hsl(var(--chart-2))',
  Social: 'hsl(var(--chart-3))',
  Practical: 'hsl(var(--chart-4))',
  Creative: 'hsl(var(--chart-5))',
};

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Physical: Dumbbell,
  Mental: BrainCircuit,
  Social: Users,
  Practical: Wrench,
  Creative: Paintbrush,
  Challenge: Trophy,
  Verify: ShieldCheck,
  Store: Store,
  Guilds: Building2,
  Streak: Flame,
  Gems: Gem,
  Events: Megaphone,
  Radio: Radio
};

export const TRAIT_ICONS = {
    pioneer: Crown,
    innovator: Lightbulb,
    specialist: Star,
    jack_of_all_trades: Award,
    vindicator: ShieldCheck,
    soul_sworn: HeartHandshake,
    state_best: Trophy,
    night_owl: Moon,
    early_bird: Sunrise,
    focused: Crosshair,
    polymath: Sparkles,
    streaker: Zap,
    socialite: Handshake,
    hermit: PersonStanding,
    mentor: BookOpen,
};

export const STORE_ITEM_ICONS: Record<string, React.ElementType> = {
  RectangleHorizontal,
  Glasses,
  Shield,
  Shirt,
};

export type { EvolutionPathData };
