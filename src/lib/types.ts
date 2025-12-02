
import { Dumbbell, BrainCircuit, Users, Wrench, Paintbrush, Swords, Flame, Gem, ShieldAlert, ShieldCheck } from 'lucide-react';

export type Archetype = 'Titan' | 'Sage' | 'Maverick';

export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';

export type Gender = 'Male' | 'Female' | 'Non-binary';
export type BodyType = 'Slim' | 'Athletic' | 'Muscular';

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
  userSkills: Record<string, UserSkillData>;
  avatarLayers?: Partial<Record<SkillCategory, boolean>>;
  momentumFlameActive: boolean;
  gems: number;
  streakFreezes: number;
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
}

export interface Territory {
  id: string;
  faction: SkillCategory;
  challengeDescription: string;
  endsAt: number; // Unix timestamp
  scores: Record<string, number>; // fireteamId: score
}


export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Physical: 'hsl(var(--chart-5))', // red
  Mental: 'hsl(var(--chart-2))',   // blue
  Social: 'hsl(var(--chart-1))',   // purple
  Practical: 'hsl(var(--chart-3))', // green
  Creative: 'hsl(var(--chart-4))',  // yellow
};

export const CATEGORY_ICONS: Record<SkillCategory | 'Challenge' | 'Streak' | 'Gems' | 'Verify', React.ComponentType<{ className?: string }>> = {
  Physical: Dumbbell,
  Mental: BrainCircuit,
  Social: Users,
  Practical: Wrench,
  Creative: Paintbrush,
  Challenge: Swords,
  Streak: Flame,
  Gems: Gem,
  Verify: ShieldCheck,
};

    