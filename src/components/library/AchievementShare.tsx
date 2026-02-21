'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Share2, Download, Sparkles, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAchievementCard } from '@/actions/generateAchievementCard';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, Skill } from '@/lib/types';
import { haptics } from '@/lib/haptics';

interface AchievementShareProps {
  user: User;
  skill: Skill;
}

export function AchievementShare({ user, skill }: AchievementShareProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const handleForgeCard = async () => {
    haptics.light();
    setIsGenerating(true);
    try {
      const result = await generateAchievementCard({
        avatarUrl: user.avatarUrl || user.baseAvatarUrl || '',
        skillName: skill.name,
        category: skill.category,
        userName: user.userName,
      });
      setCardUrl(result.cardDataUri);
      setShowModal(true);
      haptics.success();
      toast({
        title: 'Achievement Forged!',
        description: 'Your Discovery Card is ready for the world to see.',
      });
    } catch (error) {
      haptics.error();
      toast({
        variant: 'destructive',
        title: 'Forge Failed',
        description: error instanceof Error ? error.message : 'Could not generate card.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    haptics.light();
    if (navigator.share && cardUrl) {
      try {
        // Fetch the data URI and convert to a file for sharing
        const blob = await (await fetch(cardUrl)).blob();
        const file = new File([blob], `ATLAS_Pioneer_${skill.name}.png`, { type: blob.type });
        
        await navigator.share({
          title: `Pioneer Discovery: ${skill.name}`,
          text: `I just pioneered the skill "${skill.name}" in the ATLAS Nebula!`,
          files: [file],
        });
      } catch (err) {
        console.error('Sharing failed', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`I just pioneered the skill "${skill.name}" in the ATLAS Nebula! #ATLAS #Pioneer`);
      toast({ description: 'Invite signal copied to clipboard!' });
    }
  };

  const handleDownload = () => {
    haptics.light();
    if (!cardUrl) return;
    const link = document.createElement('a');
    link.href = cardUrl;
    link.download = `ATLAS_Pioneer_${skill.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8">
      {!cardUrl ? (
        <Card className="border-accent/50 bg-accent/5 border-dashed">
          <CardHeader className="text-center">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
            <CardTitle className="text-xl font-headline">Celebrate Your Discovery</CardTitle>
            <CardDescription>
              As the Pioneer of this discipline, you can forge a high-res Discovery Card to share your legacy.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={handleForgeCard} 
              disabled={isGenerating}
              size="lg"
              className="font-bold bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Forge Discovery Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Button variant="outline" onClick={() => setShowModal(true)} className="w-full">
            <Share2 className="mr-2 h-4 w-4" /> View Discovery Card
          </Button>
        </div>
      )}

      <AnimatePresence>
        {showModal && cardUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute -top-12 right-0 text-white hover:bg-white/10"
                onClick={() => setShowModal(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              
              <Card className="overflow-hidden border-primary/20 shadow-2xl shadow-primary/20">
                <CardContent className="p-0">
                  <img src={cardUrl} alt="Achievement Card" className="w-full h-auto" />
                </CardContent>
                <CardFooter className="p-4 bg-card flex gap-4">
                  <Button onClick={handleDownload} className="flex-1 font-bold">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" /> Share Native
                  </Button>
                </CardFooter>
              </Card>
              <p className="text-center text-xs text-muted-foreground mt-4 uppercase tracking-[0.3em]">
                Verified Discovery • Sector: {user.region || 'Global'}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
