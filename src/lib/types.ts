import { Dumbbell, BrainCircuit, Users, Wrench, Paintbrush, Swords, Flame, Gem, ShieldCheck, Crown, Lightbulb, Star, Award, HeartHandshake, Building2, Trophy, Store, Moon, Sunrise, Crosshair, Sparkles, Zap, Handshake, PersonStanding, BookOpen, MessageSquare, Megaphone, Radio, Glasses, RectangleHorizontal, Shield } from 'lucide-react';
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
  momentumFlameActive: boolean;
  gems: number;
  streakFreezes: number;
  traits?: Record<string, boolean>;
  verificationVotes?: number;
  region?: string;
  aiGeneratedCosmetics?: Record<string, GeneratedCosmetic>;
  suggestedCosmetics?: GeneratedCosmetic[];
  evolutionPath?: EvolutionPathData;
  evolutionLevel?: number;
}

// ... Keep your Skill, Log, Fireteam, Message, Guild, Territory, GlobalEvent, StoreItem, and Radio interfaces here ...

export const CATEGORY_ICONS = {
  Physical: Dumbbell,
  Mental: BrainCircuit,
  Social: Users,
  Practical: Wrench,
  Creative: Paintbrush,
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

export const STORE_ITEM_ICONS = {
  RectangleHorizontal,
  Glasses,
  Shield,
};

export type { EvolutionPathData };
