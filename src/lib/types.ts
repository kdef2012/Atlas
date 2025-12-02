
import { Dumbbell, BrainCircuit, Users, Wrench, Paintbrush } from 'lucide-react';

export type Archetype = 'Titan' | 'Sage' | 'Maverick';

export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';

export interface User {
  id: string;
  archetype: Archetype;
  email: string | null;
  userName: string;
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
}

export interface Skill {
  id:string;
  name: string;
  category: SkillCategory;
  xp: number;
  pioneer?: boolean; // Is this a user-discovered skill?
  pioneerUserId?: string;
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

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Physical: 'hsl(var(--chart-5))', // red
  Mental: 'hsl(var(--chart-2))',   // blue
  Social: 'hsl(var(--chart-1))',   // purple
  Practical: 'hsl(var(--chart-3))', // green
  Creative: 'hsl(var(--chart-4))',  // yellow
};

export const CATEGORY_ICONS: Record<SkillCategory, React.ComponentType<{ className?: string }>> = {
  Physical: Dumbbell,
  Mental: BrainCircuit,
  Social: Users,
  Practical: Wrench,
  Creative: Paintbrush,
};
