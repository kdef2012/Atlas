
import type { SkillCategory } from "./types";

export interface Quest {
  id: string;
  name:string;
  description: string;
  category: SkillCategory | 'Intro';
  isCompleted: boolean;
  isVerified?: boolean; 
  verificationPhotoUrl?: string;
  userId: string;
}
