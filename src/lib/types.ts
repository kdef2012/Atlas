

import { Dumbbell, BrainCircuit, Users, Wrench, Paintbrush, Swords, Flame, Gem, ShieldCheck, Crown, Lightbulb, Star, Award, HeartHandshake, Building2, Trophy } from 'lucide-react';

export type Archetype = 'Titan' | 'Sage' | 'Maverick';

export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';

export type Gender = 'Male' | 'Female' | 'Non-binary';
export type BodyType = 'Slim' | 'Athletic' | 'Muscular';

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
  bodyType?: BodyType;
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
  guildId?: string;
  userSkills: Record<string, UserSkillData>;
  avatarLayers?: Partial<Record<SkillCategory, boolean>>;
  momentumFlameActive: boolean;
  gems: number;
  streakFreezes: number;
  traits?: Partial<Record<string, boolean>>;
  verificationVotes?: number;
  region?: string;
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

export interface Guild {
    id: string;
    name: string;
    category: SkillCategory;
    region: string;
    ownerId: string;
    members: Record<string, boolean>;
}

export interface Territory {
  id: string;
  faction: SkillCategory;
  challengeDescription: string;
  endsAt: number; // Unix timestamp
  scores: Record<string, number>; // fireteamId: score
  awarded?: boolean; // New field to track if State Best trait has been awarded
}


export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Physical: 'hsl(var(--chart-5))', // red
  Mental: 'hsl(var(--chart-2))',   // blue
  Social: 'hsl(var(--chart-1))',   // purple
  Practical: 'hsl(var(--chart-3))', // green
  Creative: 'hsl(var(--chart-4))',  // yellow
};

export const CATEGORY_ICONS: Record<SkillCategory | 'Challenge' | 'Streak' | 'Gems' | 'Verify' | 'Guilds', React.ComponentType<{ className?: string }>> = {
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
};

export const TRAIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    pioneer: Crown,
    innovator: Lightbulb,
    specialist: Star,
    jack_of_all_trades: Award,
    vindicator: ShieldCheck,
    soul_sworn: HeartHandshake,
    state_best: Trophy,
};
