
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Radio, Loader2, Play, Pause, FileText, Forward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRadioBroadcast } from '@/ai/flows/generate-radio-broadcast';
import type { AtlasRadioBroadcast, Fireteam, Skill, User } from '@/lib/types';
import { useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';

export default function RadioPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [currentBroadcast, setCurrentBroadcast] = useState<AtlasRadioBroadcast | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user } = useUser();

    // Fetch previous broadcasts
    const broadcastsCollection = useMemoFirebase(() => collection(firestore, 'radio-broadcasts'), [firestore]);
    const recentBroadcastsQuery = useMemoFirebase(() => query(broadcastsCollection, orderBy('timestamp', 'desc'), limit(5)), [broadcastsCollection]);
    const { data: recentBroadcasts, isLoading: areBroadcastsLoading } = useCollection<AtlasRadioBroadcast>(recentBroadcastsQuery);

    const handleGenerateBroadcast = async () => {
        setIsLoading(true);
        setCurrentBroadcast(null);

        try {
            // Fetch necessary data for the broadcast
            // This is a simplified example; in a real app, you might get this from a cached state or a dedicated API
            const skillsQuery = query(collection(firestore, 'skills'), orderBy('xp', 'desc'), limit(3));
            const skillsSnap = await getDocs(skillsQuery);
            const trendingSkills = skillsSnap.docs.map(d => d.data() as Skill);

            const result = await generateRadioBroadcast({
                trendingSkills: trendingSkills.map(s => ({ name: s.name, category: s.category })),
            });

            setCurrentBroadcast(result);
            toast({
                title: "ATLAS Radio is On Air!",
                description: "Today's broadcast has been generated.",
            });

        } catch (error) {
            console.error("Failed to generate broadcast:", error);
            toast({
                variant: 'destructive',
                title: "Broadcast Failed",
                description: "Could not generate the radio broadcast. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
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

    const loadBroadcast = (broadcast: AtlasRadioBroadcast) => {
        setCurrentBroadcast(broadcast);
        setIsPlaying(false); // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-2">
                         <Radio className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-4xl">ATLAS Radio</CardTitle>
                    <CardDescription>
                        The pulse of the Nebula, delivered by your host, DJ Nova.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                     <Button onClick={handleGenerateBroadcast} disabled={isLoading || !user} size="lg">
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Play className="mr-2" />}
                        {isLoading ? 'Generating Broadcast...' : "Go Live with Today's Broadcast"}
                    </Button>
                </CardContent>
            </Card>

            <AnimatePresence>
            {currentBroadcast && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <FileText />
                                Broadcast Transcript
                            </CardTitle>
                             <CardDescription>
                                Generated on {new Date(currentBroadcast.timestamp).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                                <Button onClick={togglePlay} size="icon" className="w-12 h-12 flex-shrink-0">
                                    {isPlaying ? <Pause /> : <Play />}
                                </Button>
                                <div className="w-full h-2 bg-muted rounded-full">
                                    {/* This would be a progress bar in a real implementation */}
                                </div>
                                <audio 
                                    ref={audioRef} 
                                    src={currentBroadcast.audioUrl} 
                                    onEnded={() => setIsPlaying(false)}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                            </div>
                            <ScrollArea className="h-60 p-4 border rounded-md bg-background">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentBroadcast.script}</p>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
            </AnimatePresence>

            <Card>
                <CardHeader>
                    <CardTitle>Broadcast Archives</CardTitle>
                    <CardDescription>Listen to the five most recent broadcasts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {areBroadcastsLoading ? (
                        <p className="text-muted-foreground">Loading archives...</p>
                    ) : recentBroadcasts && recentBroadcasts.length > 0 ? (
                        <div className="space-y-2">
                            {recentBroadcasts.map(b => (
                                <div key={b.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                    <p className="text-sm">{new Date(b.timestamp).toLocaleString()}</p>
                                    <Button size="sm" variant="ghost" onClick={() => loadBroadcast(b)}>
                                        <Forward className="mr-2 h-4 w-4" />
                                        Load
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No archived broadcasts found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    