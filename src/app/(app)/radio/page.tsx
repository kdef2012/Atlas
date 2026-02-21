'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Radio, Loader2, Play, Pause, Rewind, Info, Zap, Trophy, Mic2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { generateRadioBroadcast } from '@/ai/flows/generate-radio-broadcast';
import type { AtlasRadioBroadcast, Fireteam, Skill, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

function BroadcastPlayer({ broadcast }: { broadcast: AtlasRadioBroadcast }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const rewind = () => {
      if(audioRef.current) {
          audioRef.current.currentTime = 0;
      }
  }

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio?.addEventListener('ended', handleEnded);
    return () => {
      audio?.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="mt-4 p-4 border rounded-lg bg-secondary/50">
        <div className="flex items-center gap-4">
             <Button size="icon" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <div className="flex-1">
                <p className="font-semibold">ATLAS Radio</p>
                <p className="text-sm text-muted-foreground">Broadcast from {format(new Date(broadcast.timestamp), 'PPP')}</p>
            </div>
             <Button size="icon" variant="ghost" onClick={rewind}>
                <Rewind className="w-5 h-5" />
            </Button>
        </div>
        <audio ref={audioRef} src={broadcast.audioUrl} className="w-full hidden" />
        <ScrollArea className="h-48 mt-4 p-3 bg-background/50 rounded">
            <p className="text-sm whitespace-pre-wrap font-mono">{broadcast.script}</p>
        </ScrollArea>
    </div>
  );
}


function RecentBroadcasts({ onSelectBroadcast }: { onSelectBroadcast: (b: AtlasRadioBroadcast) => void }) {
    const firestore = useFirestore();
    const broadcastsQuery = useMemoFirebase(() => query(collection(firestore, 'radio-broadcasts'), orderBy('timestamp', 'desc'), limit(5)), [firestore]);
    const { data: broadcasts, isLoading } = useCollection<AtlasRadioBroadcast>(broadcastsQuery);

    if (isLoading) {
        return <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full"/>)}
        </div>
    }

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-primary" />
                Recent Broadcasts
            </h3>
            {broadcasts && broadcasts.length > 0 ? broadcasts.map(b => (
                <button
                    key={b.id}
                    onClick={() => onSelectBroadcast(b)}
                    className="w-full text-left p-3 rounded-md hover:bg-secondary transition-colors border border-transparent hover:border-primary/20"
                >
                    <p className="font-medium">ATLAS Radio - {format(new Date(b.timestamp), 'PP')}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.script.substring(0, 100)}...</p>
                </button>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No past broadcasts found.</p>}
        </div>
    );
}

export default function RadioPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentBroadcast, setCurrentBroadcast] = useState<AtlasRadioBroadcast | null>(null);
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user } = useUser();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // Fetch latest data for a more relevant broadcast
            const skillsQuery = query(collection(firestore, 'skills'), orderBy('xp', 'desc'), limit(5));
            const skillsSnapshot = await getDocs(skillsQuery);
            const trendingSkills = skillsSnapshot.docs.map(doc => doc.data() as Skill);
            
            const usersQuery = query(collection(firestore, 'users'), orderBy('xp', 'desc'), limit(5));
            const usersSnapshot = await getDocs(usersQuery);
            const topUsers = usersSnapshot.docs.map(doc => doc.data() as User);

            // Mock some "Global Lore" if no data exists to keep the AI focused
            const input = {
                trendingSkills: trendingSkills.map(s => ({ name: s.name, category: s.category })),
                newlyPioneeredSkills: [],
                factionChallengeWinners: [],
            };

            const newBroadcast = await generateRadioBroadcast(input);
            
            setCurrentBroadcast(newBroadcast);
            
            toast({
                title: "Broadcast Generated!",
                description: "ATLAS Radio is now live with the latest updates.",
            });

        } catch (error) {
            console.error("Error generating broadcast:", error);
            toast({
                variant: 'destructive',
                title: "Broadcast Failed",
                description: "Could not synchronize the signal. The AI might need more citizen data."
            });
        } finally {
            setIsGenerating(false);
        }
    }
    
    return (
         <div className="space-y-6 max-w-5xl mx-auto">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        <Radio className="w-8 h-8 text-primary" />
                        ATLAS Radio
                    </CardTitle>
                    <CardDescription>
                        Tune in to the latest news, trends, and heroic feats from across the ATLAS.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4 py-6">
                        <p className="text-muted-foreground text-center max-w-md">
                            Generate a new broadcast to hear DJ Nova summarize the latest shifts in the Nebula.
                        </p>
                        <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="px-12 font-bold shadow-lg shadow-primary/20">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Synchronizing Signal...
                                </>
                            ) : (
                                <>
                                    <Radio className="mr-2 h-5 w-5" />
                                    Go Live
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {currentBroadcast && (
                        <Card className="border-accent/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-accent" />
                                    Now Playing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <BroadcastPlayer broadcast={currentBroadcast} />
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Frequency Intel
                            </CardTitle>
                            <CardDescription>What is the purpose of this signal?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                            <div className="flex gap-3">
                                <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
                                <p><span className="font-bold text-foreground">Peer Recognition:</span> The radio celebrates Pioneers and Faction victors, turning database logs into global prestige.</p>
                            </div>
                            <div className="flex gap-3">
                                <Zap className="w-5 h-5 text-accent shrink-0" />
                                <p><span className="font-bold text-foreground">Live Intelligence:</span> Tracking trending skills allows you to identify which disciplines are gaining momentum in the real world.</p>
                            </div>
                            <div className="flex gap-3">
                                <Mic2 className="w-5 h-5 text-primary shrink-0" />
                                <p><span className="font-bold text-foreground">World Narrative:</span> DJ Nova bridges the gap between your physical efforts and your digital signature, making the Nebula feel alive.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <CardContent className="pt-6">
                            <RecentBroadcasts onSelectBroadcast={setCurrentBroadcast}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}