'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/skeleton';

export function UserCounter() {
  const firestore = useFirestore();
  const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersCollection);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // HARDENED: Ensure users exists and is not empty before attempting calculation
    if (users && users.length > 0) {
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

  if (isLoading) {
    return <Skeleton className="h-8 w-1/2" />;
  }

  return (
    <motion.span
      key={displayCount}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-2xl font-bold"
    >
      {displayCount.toLocaleString()}
    </motion.span>
  );
}
