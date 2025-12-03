
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';

function UserCounter() {
  const firestore = useFirestore();
  const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersCollection);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    if (users) {
      // Animate the count up
      let start = 0;
      const end = users.length;
      if (end === start) return;
      
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentCount = Math.floor(progress * (end - start) + start);
        setDisplayCount(currentCount);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [users]);

  if (isLoading || displayCount === 0) {
    return <span className="h-6 w-24 bg-white/10 inline-block animate-pulse rounded-md" />;
  }

  return (
    <motion.span
      key={displayCount}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-primary font-bold"
    >
      {displayCount.toLocaleString()}
    </motion.span>
  );
}

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/onboarding/archetype');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white overflow-hidden">
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="text-center z-10"
      >
        <h1 className="font-headline text-2xl md:text-4xl font-bold mb-4" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
          Your life has been waiting for a player.
        </h1>
        <p className="mb-10 text-lg text-muted-foreground" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
            <UserCounter /> pilots currently active in ATLAS.
        </p>
        <motion.button
          onClick={handleStart}
          className="font-headline text-xl bg-transparent border border-white rounded-md px-8 py-3 text-white transition-all duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          [PRESS START]
        </motion.button>
      </motion.div>
      <div className="absolute inset-0 z-0 opacity-5" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    </main>
  );
}
