export type Archetype = 'Titan' | 'Sage' | 'Maverick';

export type SkillCategory = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';

export interface User {
  id: string;
  name: string;
  archetype: Archetype;
  level: number;
  xp: number;
  stats: Record<SkillCategory, number>;
  lastLogTimestamp: number; // Unix timestamp
  fireteamId?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  xp: number;
  level: number;
  creatorId: string;
  users: number; // count of users who adopted this skill
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: SkillCategory | 'Intro';
  isCompleted: boolean;
}

export interface Fireteam {
  id: string;
  name: string;
  members: User[];
  streakActive: boolean;
}

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Physical: 'hsl(var(--chart-5))', // red-ish
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
