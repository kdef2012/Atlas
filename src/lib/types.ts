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
  id: string;
  name: string;
  category: SkillCategory;
  xp: number;
  pioneer?: boolean; // Is this a user-discovered skill?
  pioneerUserId?: string;
}

export interface Log {
    id: string;
    userId: string;
    skillId: string;
    timestamp: number;
    xp: number;
    verificationPhotoUrl?: string;
}

export interface Quest {
  id: string;
  name:string;
  description: string;
  category: SkillCategory | 'Intro';
  isCompleted: boolean;
}

export interface Fireteam {
  id: string;
  name: string;
  region: string;
  state: string;
  country: string;
  members: string[]; // array of user IDs
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
  Physical: require('lucide-react').Dumbbell,
  Mental: require('lucide-react').BrainCircuit,
  Social: require('lucide-react').Users,
  Practical: require('lucide-react').Wrench,
  Creative: require('lucide-react').Paintbrush,
};
