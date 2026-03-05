'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit, where } from 'firebase/firestore';
import type { User, Skill, Fireteam, SkillCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Users, Zap, BrainCircuit, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';

type SpotlightItem = {
    type: 'focus' | 'fireteam' | 'trending' | 'puzzle' | 'echo';
    title: string;
    description: string;
    icon: React.ReactNode;
    answer?: string;
};

// Simplified PublicLog for the echo feature
interface PublicLog {
    skillName: string;
    category: SkillCategory;
    userRegion: string;
    timestamp: number;
}

function useSpotlightData() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();

    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: userLoading } = useDoc<User>(userRef);

    const fireteamRef = useMemoFirebase(() => user?.fireteamId ? doc(firestore, 'fireteams', user.fireteamId) : null, [firestore, user?.fireteamId]);
    const { data: fireteam, isLoading: fireteamLoading } = useDoc<Fireteam>(fireteamRef);
    
    const membersQuery = useMemoFirebase(() => {
        if (!fireteam) return null;
        const memberIds = Object.keys(fireteam.members);
        if (memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', memberIds));
    }, [firestore, fireteam]);
    const { data: fireteamMembers, isLoading: membersLoading } = useCollection<User>(membersQuery);

    const skillsQuery = useMemoFirebase(() => query(collection(firestore, 'skills'), orderBy('xp', 'desc'), limit(1)), [firestore]);
    const { data: trendingSkills, isLoading: skillsLoading } = useCollection<Skill>(skillsQuery);
    
    const publicLogsQuery = useMemoFirebase(() => query(collection(firestore, 'public-logs'), orderBy('timestamp', 'desc'), limit(1)), [firestore]);
    const { data: recentLogs, isLoading: logsLoading } = useCollection<PublicLog>(publicLogsQuery);


    const isLoading = userLoading || fireteamLoading || membersLoading || skillsLoading || logsLoading;

    return { user, fireteamMembers, trendingSkill: trendingSkills?.[0], recentLog: recentLogs?.[0], isLoading };
}


export function SpotlightCard() {
    const { user, fireteamMembers, trendingSkill, recentLog, isLoading } = useSpotlightData();
    const [spotlightItems, setSpotlightItems] = useState<SpotlightItem[]>([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [puzzleAnswer, setPuzzleAnswer] = useState('');
    const [puzzleStatus, setPuzzleStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    useEffect(() => {
        const items: SpotlightItem[] = [];

        // 1. Today's Focus
        if (user) {
            const stats = [
                { name: 'Physical', value: user.physicalStat },
                { name: 'Mental', value: user.mentalStat },
                { name: 'Social', value: user.socialStat },
                { name: 'Practical', value: user.practicalStat },
                { name: 'Creative', value: user.creativeStat },
            ];
            const lowestStat = stats.sort((a, b) => a.value - b.value)[0];
            items.push({
                type: 'focus',
                title: "Today's Focus",
                description: `Your ${lowestStat.name} energy is lowest. Time to train!`,
                icon: <Target className="w-6 h-6 text-red-400" />
            });
        }
        
        // 5. Echoes of the Nebula
        if (recentLog) {
            items.push({
                type: 'echo',
                title: "Echoes of the Nebula",
                description: `A user in ${recentLog.userRegion} just logged "${recentLog.skillName}".`,
                icon: <Activity className="w-6 h-6 text-green-400" />
            });
        }

        // 2. Fireteam Spotlight
        if (fireteamMembers && fireteamMembers.length > 1) {
            // Find member with highest level (excluding current user)
            const otherMembers = fireteamMembers.filter(m => m.id !== user?.id);
            if (otherMembers.length > 0) {
                const topMember = otherMembers.sort((a, b) => b.level - a.level)[0];
                items.push({
                    type: 'fireteam',
                    title: "Fireteam Spotlight",
                    description: `${topMember.userName} is crushing it at Level ${topMember.level}!`,
                    icon: <Users className="w-6 h-6 text-purple-400" />
                });
            }
        }
        
        // 3. Trending Skill
        if (trendingSkill) {
            items.push({
                type: 'trending',
                title: "Trending Skill",
                description: `"${trendingSkill.name}" is popular in the ATLAS right now.`,
                icon: <Zap className="w-6 h-6 text-yellow-400" />
            });
        }

        // 4. Mini-Game / Puzzle
        items.push({
            type: 'puzzle',
            title: "Mental Agility Puzzle",
            description: "I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?",
            icon: <BrainCircuit className="w-6 h-6 text-blue-400" />,
            answer: 'map'
        });
        
        setSpotlightItems(items);
    }, [user, fireteamMembers, trendingSkill, recentLog]);

    useEffect(() => {
        if (spotlightItems.length > 0 && puzzleStatus === 'idle') {
            const interval = setInterval(() => {
                setCurrentItemIndex((prevIndex) => (prevIndex + 1) % spotlightItems.length);
            }, 7000); // Rotate every 7 seconds
            return () => clearInterval(interval);
        }
    }, [spotlightItems, puzzleStatus]);

    const handleCheckAnswer = () => {
        const currentItem = spotlightItems[currentItemIndex];
        if (currentItem.type === 'puzzle' && currentItem.answer) {
            if (puzzleAnswer.toLowerCase().trim().includes(currentItem.answer)) {
                haptics.success();
                setPuzzleStatus('correct');
                setTimeout(() => {
                    setPuzzleStatus('idle');
                    setPuzzleAnswer('');
                    setCurrentItemIndex((prev) => (prev + 1) % spotlightItems.length);
                }, 2000);
            } else {
                haptics.error();
                setPuzzleStatus('wrong');
                setTimeout(() => setPuzzleStatus('idle'), 2000);
            }
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-28 w-full" />;
    }

    const currentItem = spotlightItems[currentItemIndex];

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4">
                <AnimatePresence mode="wait">
                    {currentItem && (
                        <motion.div
                            key={currentItem.type + currentItem.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col sm:flex-row items-center gap-4"
                        >
                            <div className="p-3 bg-secondary rounded-lg shrink-0">
                                {currentItem.icon}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{currentItem.title}</h3>
                                <p className="text-sm leading-tight mt-1">{currentItem.description}</p>
                                
                                {currentItem.type === 'puzzle' && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <Input 
                                            placeholder="Type your answer..." 
                                            value={puzzleAnswer}
                                            onChange={(e) => setPuzzleAnswer(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                                            className="h-8 text-xs bg-background/50"
                                            disabled={puzzleStatus !== 'idle'}
                                        />
                                        <Button 
                                            size="sm" 
                                            className="h-8 text-[10px] font-black uppercase tracking-tighter"
                                            onClick={handleCheckAnswer}
                                            disabled={puzzleStatus !== 'idle'}
                                        >
                                            {puzzleStatus === 'correct' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : 
                                             puzzleStatus === 'wrong' ? <XCircle className="w-4 h-4 text-red-400" /> : 
                                             'Verify'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
            {/* Progress bar for the rotation */}
            <motion.div 
                key={`progress-${currentItemIndex}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 7, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-0.5 bg-primary/20"
            />
        </Card>
    );
}