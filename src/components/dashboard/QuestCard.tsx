import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS, CATEGORY_ICONS, type SkillCategory } from "@/lib/types";
import type { Quest } from "@/lib/quest";
import { Sparkles } from "lucide-react";
import { haptics } from "@/lib/haptics";

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  // Defensive check for icon rendering to prevent Error #130
  const Icon = (quest.category !== 'Intro' && CATEGORY_ICONS[quest.category as SkillCategory]) 
    ? CATEGORY_ICONS[quest.category as SkillCategory] 
    : Sparkles;
    
  const color = (quest.category !== 'Intro' && CATEGORY_COLORS[quest.category as SkillCategory]) 
    ? CATEGORY_COLORS[quest.category as SkillCategory] 
    : 'hsl(var(--primary))';

  const handleInteraction = () => {
    if (!quest.isCompleted) {
      haptics.light();
    }
  };

  return (
    <Card 
      onClick={handleInteraction}
      className="bg-card/50 hover:bg-card transition-colors cursor-pointer"
    >
      <CardContent className="p-4 flex items-start space-x-4">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color.replace(')', ' / 0.1)')}`, color: color }}
        >
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold">{quest.name}</h3>
            {quest.isCompleted && <Badge variant="secondary">Done</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{quest.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}