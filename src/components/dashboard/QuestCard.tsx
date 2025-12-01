import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS, CATEGORY_ICONS, type Quest } from "@/lib/types";

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const Icon = quest.category !== 'Intro' ? CATEGORY_ICONS[quest.category] : require('lucide-react').Sparkles;
  const color = quest.category !== 'Intro' ? CATEGORY_COLORS[quest.category] : 'hsl(var(--primary))';

  return (
    <Card className="bg-card/50 hover:bg-card transition-colors">
      <CardContent className="p-4 flex items-start space-x-4">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color.replace(')', ' / 0.1)')}`, color: color }}
        >
          <Icon className="h-6 w-6" />
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
