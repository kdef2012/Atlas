
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-user-skills.ts';
import '@/ai/flows/generate-first-quest.ts';
import '@/ai/flows/find-or-create-skill.ts';
import '@/ai/flows/generate-quests.ts';
import '@/ai/flows/generate-faction-challenges.ts';
import '@/ai/flows/assign-personality-traits.ts';
import '@/ai/flows/generate-radio-broadcast.ts';
import '@/ai/flows/generate-resume.ts';
import '@/ai/flows/generate-skill-guide.ts';
