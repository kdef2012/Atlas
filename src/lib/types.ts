

import { Dumbbell, BrainCircuit, Users, Wrench, Paintbrush, Swords, Flame, Gem, ShieldCheck, Crown, Lightbulb, Star, Award, HeartHandshake, Building2, Trophy, Store, Moon, Sunrise, Crosshair, Sparkles, Zap, Handshake, PersonStanding, BookOpen, MessageSquare, Megaphone, Glasses, RectangleHorizontal, Shield } from 'lucide-react';

export type Archetype = 'Titan' | 'Sage' | 'Maverick';

export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';

export type Gender = 'Male' | 'Female';
export type AvatarStyle = string;


export interface UserSkillData {
  isUnlocked: boolean;
  xp: number;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof TRAIT_ICONS;
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
  lastLogTimestamp: number; // Unix timestamp
  createdAt: number;
  level: number;
  xp: number;
  fireteamId?: string;
  guilds?: Record<string, boolean>; // Changed from guildId
  userSkills: Record<string, UserSkillData>;
  avatarLayers?: Partial<Record<string, boolean>>;
  momentumFlameActive: boolean;
  gems: number;
  streakFreezes: number;
  traits?: Partial<Record<string, boolean>>;
  verificationVotes?: number;
  region?: string;
  isAdmin?: boolean; // <-- ADDED
}

export interface Skill {
  id:string;
  name: string;
  description: string;
  category: SkillCategory;
  xp: number;
  pioneer?: boolean; // Is this a user-discovered skill?
  pioneerUserId?: string;
  prerequisites?: string[]; // Array of skill IDs
  cost?: {
    category: SkillCategory;
    points: number;
  };
  innovatorAwarded?: boolean;
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
  streakStartDate?: number;
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
    skillId: string; // The skill this guild is for
    category: SkillCategory;
    region: string; // Region of origin
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
  endsAt: number; // Unix timestamp
  scores: Record<string, number>; // fireteamId: score
  awarded?: boolean; // New field to track if State Best trait has been awarded
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  suggestion: string;
  timestamp: number;
  isArchived: boolean;
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
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: keyof typeof STORE_ITEM_ICONS;
  layerKey: string;
}


export const CATEGORY_ICONS: Record<SkillCategory | 'Challenge' | 'Streak' | 'Gems' | 'Verify' | 'Guilds' | 'Store' | 'Suggestion' | 'Events', React.ComponentType<{ className?: string }>> = {
  Physical: Dumbbell,
  Mental: BrainCircuit,
  Social: Users,
  Practical: Wrench,
  Creative: Paintbrush,
  Challenge: Swords,
  Streak: Flame,
  Gems: Gem,
  Verify: ShieldCheck,
  Guilds: Building2,
  Store: Store,
  Suggestion: MessageSquare,
  Events: Megaphone,
};

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Physical: 'hsl(var(--chart-5))', // red
  Mental: 'hsl(var(--chart-2))',   // blue
  Social: 'hsl(var(--chart-1))',   // purple
  Practical: 'hsl(var(--chart-3))', // green
  Creative: 'hsl(var(--chart-4))',  // yellow
};


export const TRAIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

    

    

    