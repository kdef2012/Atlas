import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS, CATEGORY_ICONS, type SkillCategory } from "@/lib/types";
import type { Quest } from "@/lib/quest";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState } from "react";

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const firestore = useFirestore();
  const [isCompleting, setIsCompleting] = useState(false);

  const Icon = (quest.category !== 'Intro' && CATEGORY_ICONS[quest.category as SkillCategory]) 
    ? CATEGORY_ICONS[quest.category as SkillCategory] 
    : Sparkles;
    
  const color = (quest.category !== 'Intro' && CATEGORY_COLORS[quest.category as SkillCategory]) 
    ? CATEGORY_COLORS[quest.category as SkillCategory] 
    : 'hsl(var(--primary))';

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quest.isCompleted) return;

    haptics.success();
    setIsCompleting(true);
    
    const questRef = doc(firestore, 'users', quest.userId, 'quests', quest.id);
    updateDocumentNonBlocking(questRef, { isCompleted: true });
    
    // No need to set isCompleting false as the component will re-render with isCompleted true
  };

  return (
    <Card 
      className="bg-card/50 hover:bg-card transition-colors relative overflow-hidden"
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
            {quest.isCompleted ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Archived
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{quest.description}</p>
          
          {!quest.isCompleted && (
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3 h-8 text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/10"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
              Complete Objective
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}