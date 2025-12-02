
'use client';

import Link from 'next/link';
import { redirect, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Box, ShieldAlert, Sparkles, Gem, Shirt } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardPageProps {}

function LootBox() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative w-48 h-48 cursor-pointer" onClick={() => setIsOpen(true)}>
             <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Box className="w-full h-full text-yellow-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 10px yellow)'}}/>
                        <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-300 animate-ping" />
                    </motion.div>
                )}
            </AnimatePresence>
             <AnimatePresence>
                {isOpen && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center"
                     >
                        <div className="w-full h-full bg-yellow-400/20 rounded-full blur-2xl" />
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
    )
}

export default function RewardPage({}: RewardPageProps) {
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;
  const { user } = useUser();
  const firestore = useFirestore();
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    const claimReward = async () => {
      if (user && archetype) {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        // Only apply the rewards if the user is still level 0 to prevent replay.
        if (userDoc.exists() && userDoc.data().level === 0) {
          updateDocumentNonBlocking(userRef, { 
            level: 1, 
            xp: 50,
            gems: 3,
            streakFreezes: 1, // As per original design, a streak freeze is a good first reward
            'avatarLayers.newbie_sweatband': true, // Equip the cosmetic
          });
        }
      }
    };
    
    if (isClaimed) {
        claimReward();
    }
  }, [isClaimed, user, firestore, archetype]);

  if (!archetype) {
    redirect('/onboarding/archetype');
  }
  
  const handleClaim = () => {
    setIsClaimed(true);
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black">
        <AnimatePresence>
        {isClaimed && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2 } }}
                exit={{ opacity: 0 }}
                className="text-center mb-8 z-10"
            >
                <h1 className="font-headline text-5xl md:text-7xl font-bold text-yellow-400" style={{ textShadow: '0 0 15px yellow' }}>LEVEL UP!</h1>
                <p className="text-lg text-muted-foreground mt-2">You are now Level 1. Your journey has begun.</p>
            </motion.div>
        )}
        </AnimatePresence>
      
      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">Victory Spoils</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <LootBox />
            <AnimatePresence>
            {isClaimed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="grid grid-cols-2 gap-4 text-center w-full"
                >
                    <div className="bg-black/20 p-3 rounded-lg">
                        <p className="font-bold text-lg text-primary flex items-center justify-center gap-2"><Shirt className="w-4 h-4"/> Newbie Sweatband</p>
                        <p className="text-sm text-muted-foreground">(Cosmetic)</p>
                    </div>
                     <div className="bg-black/20 p-3 rounded-lg">
                        <p className="font-bold text-lg text-accent flex items-center justify-center gap-2"><Gem className="w-4 h-4" /> Gems</p>
                        <p className="text-sm text-muted-foreground">(x3)</p>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        {isClaimed ? (
             <Button asChild size="lg" className="w-full font-bold group">
                <Link href="/?first_quest_complete=true">
                    Enter the ATLAS
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        ) : (
            <Button onClick={handleClaim} size="lg" className="w-full font-bold group animate-pulse">
                Open Chest
                <Sparkles className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>
    </main>
  );
}
