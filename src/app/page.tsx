
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

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
    return <span className="h-6 w-24 bg-foreground/10 inline-block animate-pulse rounded-md" />;
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground overflow-hidden">

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
          className="font-headline text-xl bg-transparent border border-foreground rounded-md px-8 py-3 text-foreground transition-all duration-300 hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-foreground"
          style={{ fontFamily: '"Courier New", Courier, monospace', animation: 'pulse-glow 2s infinite ease-in-out' }}
        >
          [PRESS START]
        </motion.button>
        <div className="absolute bottom-4 right-4">
            <Link href="/login">
                <Shield className="w-6 h-6 text-muted-foreground/20 hover:text-muted-foreground transition-colors" />
            </Link>
        </div>
      </motion.div>
      <div className="absolute inset-0 z-0 opacity-5" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px transparent;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 15px hsl(var(--primary) / 0.7);
            transform: scale(1.02);
          }
        }
      `}</style>
    </main>
  );
}
