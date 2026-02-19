"use client";

import { useState, useEffect, useRef } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc, collection, query, orderBy, limit } from "firebase/firestore";
import type { User, AtlasRadioBroadcast } from "@/lib/types";
import { Radio, Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * AppHeader with Global Radio Mini-Player
 */
export function AppHeader() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const broadcastsQuery = useMemoFirebase(() => 
    query(collection(firestore, 'radio-broadcasts'), orderBy('timestamp', 'desc'), limit(1)),
    [firestore]
  );
  const { data: latestBroadcast } = useCollection<AtlasRadioBroadcast>(broadcastsQuery);
  const broadcast = latestBroadcast?.[0];

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

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio?.addEventListener('ended', handleEnded);
    return () => audio?.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1 flex items-center gap-4">
        {broadcast && (
            <div className="hidden sm:flex items-center gap-3 bg-secondary/50 px-3 py-1.5 rounded-full border border-primary/10">
                <div className={cn("p-1.5 rounded-full bg-primary/10 text-primary", isPlaying && "animate-pulse")}>
                    <Radio className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">Nebula Radio</p>
                    <p className="text-xs font-bold truncate max-w-[120px]">DJ Nova Live</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <audio ref={audioRef} src={broadcast.audioUrl} className="hidden" />
            </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="hidden lg:inline text-muted-foreground">Signal Strength: 100%</span>
        </div>
      </div>
    </header>
  );
}
