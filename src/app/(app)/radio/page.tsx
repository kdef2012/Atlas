'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Radio, Loader2, Play, Pause, Rewind } from 'lucide-react';
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
            <h3 className="text-lg font-semibold">Recent Broadcasts</h3>
            {broadcasts && broadcasts.length > 0 ? broadcasts.map(b => (
                <button
                    key={b.id}
                    onClick={() => onSelectBroadcast(b)}
                    className="w-full text-left p-3 rounded-md hover:bg-secondary transition-colors"
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

            // In a real app, you'd fetch actual winners. For now, we'll just mock it if no data exists.
            const dummyWinner = topUsers.length > 0 && topUsers[0].fireteamId ? {
                faction: topUsers[0].archetype,
                winningFireteamName: 'Top Team',
                winningRegion: topUsers[0].region || 'Global',
                challengeDescription: 'Dominating the leaderboards'
            } : undefined;

            const input = {
                trendingSkills: trendingSkills.map(s => ({ name: s.name, category: s.category })),
                newlyPioneeredSkills: [],
                factionChallengeWinners: dummyWinner ? [dummyWinner] : [],
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
                description: "Could not generate the radio broadcast. The AI might be taking a break."
            });
        } finally {
            setIsGenerating(false);
        }
    }
    
    return (
         <div className="space-y-6">
            <Card>
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
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="text-muted-foreground text-center">
                            Generate a new broadcast to hear the latest from DJ Nova.
                        </p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Radio className="mr-2 h-4 w-4" />
                                    Go Live
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {currentBroadcast && (
                <Card>
                    <CardHeader>
                        <CardTitle>Now Playing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BroadcastPlayer broadcast={currentBroadcast} />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="pt-6">
                    <RecentBroadcasts onSelectBroadcast={setCurrentBroadcast}/>
                </CardContent>
            </Card>
        </div>
    )
}
