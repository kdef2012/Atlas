
import { generateJSON } from './gemini-client';
import { determineEvolutionPath, PATH_THEMES, type EvolutionPath } from './evolution-paths';
import type { UserActivity } from './evolution-paths';

export interface ActivityMilestone {
  activity: string;
  threshold: number;
  reached: boolean;
  cosmeticUnlocked?: string;
}

export interface EvolutionPathData {
  primaryPath: EvolutionPath;
  level: number;
  progress: number;
  nextMilestone: ActivityMilestone;
  personality: string;
  colors: string[];
}

export interface GeneratedCosmetic {
  id: string;
  name: string;
  description: string;
  earnedThrough: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  visualDescription: string;
  svgCode?: string;
  cssEffects?: {
    boxShadow?: string;
    border?: string;
    background?: string;
  };
  position?: 'head' | 'face' | 'body' | 'background' | 'aura';
  color?: string;
}

export interface ActivityAnalysisResult {
  evolutionPath: EvolutionPathData;
  earnedCosmetics: GeneratedCosmetic[];
  suggestedCosmetics: GeneratedCosmetic[];
  motivationalMessage: string;
}

/**
 * Analyze user activity and determine evolution path
 */
export async function analyzeUserActivity(
  activity: UserActivity,
  currentLevel: number
): Promise<ActivityAnalysisResult> {
  // Determine evolution path
  const path = determineEvolutionPath(activity);
  const pathTheme = PATH_THEMES[path];
  
  const systemInstruction = `You are an AI that analyzes student activity in an educational gamification app called ATLAS. 

Your role is to:
1. Determine what cosmetic items they've earned through milestones
2. Suggest future cosmetics to motivate continued engagement
3. Provide encouraging feedback

The user's evolution path is: ${path}
Path theme: ${pathTheme.personality}
Path colors: ${pathTheme.colors.join(', ')}
Path accessories: ${pathTheme.accessories.join(', ')}

Generate cosmetics that:
- Match the ${path} theme
- Are educational and appropriate for students
- Reflect the activities they've performed
- Are creative and visually interesting

Activity types and what they mean:
- business: Entrepreneurship activities, financial literacy, business projects, budgeting
- leadership: Leading teams, organizing events, decision-making
- coding: Programming, app development, tech projects
- art: Drawing, painting, digital art, design
- cooking: Meal planning, nutrition, culinary skills
- workout: Physical fitness, sports, exercise
- reading: Books, articles, educational content
- writing: Essays, stories, creative writing
- And many more...`;

  const prompt = `Analyze this ${path} user's activity:

Activity Stats:
${Object.entries(activity)
  .filter(([_, value]) => value && value > 0)
  .map(([key, value]) => `- ${key}: ${value} sessions`)
  .join('\n')}

Current Level: ${currentLevel}

Based on their ${path} evolution path, generate cosmetics that fit this theme.

For ENTREPRENEUR path specifically, include:
- Business-themed items (briefcase, tie, business card, charts)
- Financial symbols (dollar signs, graphs, growth arrows)
- Innovation items (lightbulb, gears, rocket)
- Professional attire and accessories

Return JSON in this exact format:

{
  "evolutionPath": {
    "primaryPath": "${path}",
    "level": ${currentLevel},
    "progress": <percentage 0-100>,
    "nextMilestone": {
      "activity": "activity name",
      "threshold": <number>,
      "reached": false
    },
    "personality": "${pathTheme.personality}",
    "colors": ${JSON.stringify(pathTheme.colors)}
  },
  "earnedCosmetics": [
    {
      "id": "unique_id_lowercase_underscores",
      "name": "Creative Name (match ${path} theme)",
      "description": "How they earned it",
      "earnedThrough": "activity type",
      "rarity": "common|uncommon|rare|epic|legendary",
      "visualDescription": "Detailed visual description for SVG generation matching ${path} theme",
      "position": "head|face|body|background|aura",
      "color": "<one of: ${pathTheme.colors.join(', ')}>"
    }
  ],
  "suggestedCosmetics": [
    {
      "id": "unique_id",
      "name": "Future Cosmetic Name (${path} themed)",
      "description": "What they need to do to earn it",
      "earnedThrough": "activity type",
      "rarity": "rarity level",
      "visualDescription": "Visual description matching ${path} aesthetic",
      "position": "position",
      "color": "<theme color>"
    }
  ],
  "motivationalMessage": "Encouraging message about their ${path} journey"
}

IMPORTANT:
- All cosmetics must match the ${path} theme
- Use ${path}-appropriate colors: ${pathTheme.colors.join(', ')}
- Reference ${path}-specific accessories: ${pathTheme.accessories.join(', ')}
- Personality: ${pathTheme.personality}

Return ONLY valid JSON, no markdown.`;

  try {
    const result = await generateJSON<ActivityAnalysisResult>(prompt, systemInstruction);
    
    // Ensure path matches
    result.evolutionPath.primaryPath = path;
    result.evolutionPath.personality = pathTheme.personality;
    result.evolutionPath.colors = pathTheme.colors;
    
    return result;
  } catch (error) {
    console.error('Activity analysis failed:', error);
    
    // Return fallback
    return {
      evolutionPath: {
        primaryPath: path,
        level: currentLevel,
        progress: 0,
        nextMilestone: {
          activity: 'any',
          threshold: 10,
          reached: false,
        },
        personality: pathTheme.personality,
        colors: pathTheme.colors,
      },
      earnedCosmetics: [],
      suggestedCosmetics: [],
      motivationalMessage: `Keep growing on your ${path} path!`,
    };
  }
}

/**
 * Check if user has reached any new milestones
 */
export function detectMilestones(
  oldActivity: UserActivity,
  newActivity: UserActivity
): ActivityMilestone[] {
  const milestones: ActivityMilestone[] = [];
  
  const checkMilestone = (
    activity: keyof UserActivity,
    oldValue: number,
    newValue: number,
    thresholds: number[]
  ) => {
    for (const threshold of thresholds) {
      if (oldValue < threshold && newValue >= threshold) {
        milestones.push({
          activity: activity,
          threshold,
          reached: true,
        });
      }
    }
  };
  
  // Define milestone thresholds
  const thresholds = [5, 10, 25, 50, 75, 100, 150, 200, 300, 500];
  
  // Check each activity
  Object.keys(newActivity).forEach((key) => {
    const activityKey = key as keyof UserActivity;
    const oldValue = oldActivity[activityKey] || 0;
    const newValue = newActivity[activityKey] || 0;
    
    if (newValue > oldValue) {
      checkMilestone(activityKey, oldValue, newValue, thresholds);
    }
  });
  
  return milestones;
}

/**
 * Generate milestone cosmetic with path-specific theming
 */
export async function generateMilestoneCosmetic(
  activity: string,
  threshold: number,
  userLevel: number,
  userPath: EvolutionPath
): Promise<GeneratedCosmetic> {
  const pathTheme = PATH_THEMES[userPath];
  
  const systemInstruction = `You are a cosmetic designer for an educational avatar system. 
Generate a cosmetic item for a ${userPath} path user.
Their personality: ${pathTheme.personality}
Their theme colors: ${pathTheme.colors.join(', ')}
Thematic accessories: ${pathTheme.accessories.join(', ')}`;
  
  const prompt = `User (${userPath} path) reached milestone: ${threshold} ${activity} sessions!
User Level: ${userLevel}

Generate ONE cosmetic that:
1. Matches the ${userPath} theme
2. Relates to ${activity} activity
3. Uses ${userPath} colors: ${pathTheme.colors.join(', ')}

For business/entrepreneur path specifically:
- Use professional, business-themed items
- Colors should be corporate (gold, green, blue)
- Accessories like briefcase, chart, lightbulb, tie, business card

Return JSON:
{
  "id": "${activity}_${threshold}_${userPath}",
  "name": "Creative ${userPath}-Themed Name",
  "description": "Earned by completing ${threshold} ${activity} sessions as a ${userPath}",
  "earnedThrough": "${activity}",
  "rarity": "<based on threshold: 5-10=common, 25-50=uncommon, 75-100=rare, 150+=epic, 300+=legendary>",
  "visualDescription": "Detailed description matching ${userPath} aesthetic and ${activity} activity. Use ${userPath} colors.",
  "position": "head|face|body|background|aura",
  "color": "<one of: ${pathTheme.colors.join(', ')}>"
}

Return ONLY JSON.`;

  try {
    const result = await generateJSON<GeneratedCosmetic>(prompt, systemInstruction);
    return result;
  } catch (error) {
    console.error('Milestone cosmetic generation failed:', error);
    
    // Fallback
    const rarityMap: Record<number, typeof result.rarity> = {
      5: 'common',
      10: 'common',
      25: 'uncommon',
      50: 'rare',
      100: 'epic',
      200: 'legendary',
    };
    
    const rarity = rarityMap[threshold] || 'uncommon';
    
    return {
      id: `${activity}_${threshold}_${userPath}`,
      name: `${userPath.charAt(0).toUpperCase() + userPath.slice(1)}'s ${activity} Badge`,
      description: `Earned by completing ${threshold} ${activity} sessions`,
      earnedThrough: activity,
      rarity,
      visualDescription: `A ${userPath}-themed badge commemorating ${activity} achievement`,
      position: 'body',
      color: pathTheme.colors[0],
    };
  }
}

/**
 * Calculate evolution level based on total activity
 */
export function calculateEvolutionLevel(activity: UserActivity): number {
  const totalActivity = Object.values(activity).reduce((sum, val) => sum + (val || 0), 0);
  return Math.floor(Math.sqrt(totalActivity) * 2) + 1;
}

/**
 * Get activity name in display format
 */
export function getActivityDisplayName(activity: string): string {
  const names: Record<string, string> = {
    business: 'Business & Entrepreneurship',
    leadership: 'Leadership',
    coding: 'Programming',
    art: 'Art & Design',
    cooking: 'Cooking',
    workout: 'Fitness',
    reading: 'Reading',
    writing: 'Writing',
    music: 'Music',
    // Add more as needed
  };
  
  return names[activity] || activity.charAt(0).toUpperCase() + activity.slice(1);
}

    