
'use client';

import { ArchetypeCard } from '@/components/onboarding/ArchetypeCard';
import type { Archetype } from '@/lib/types';
import { Bot, Mountain, Zap } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const archetypes: {
  name: Archetype;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    name: 'Titan',
    description:
      'Forge your body into a temple of strength and endurance. The path of physical mastery.',
    icon: <Mountain className="h-12 w-12" />,
  },
  {
    name: 'Sage',
    description:
      'Expand your mind and unravel the complexities of the universe. The path of intellectual pursuit.',
    icon: <Bot className="h-12 w-12" />,
  },
  {
    name: 'Maverick',
    description:
      'Chart your own course and defy convention with unbound creativity. The path of innovative spirit.',
    icon: <Zap className="h-12 w-12" />,
  },
];

export default function ArchetypeSelectionPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // This effect will run once when the component mounts.
  // If the user is not logged in and we are not in the process of logging them in,
  // we will initiate the anonymous sign-in process.
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  // This function is called when a user selects an archetype.
  // It creates a new user document in Firestore with the selected archetype
  // and some initial default values, then navigates to the welcome page.
  const handleSelectArchetype = (archetype: Archetype) => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const now = Date.now();
      setDocumentNonBlocking(
        userRef,
        {
          id: user.uid,
          archetype: archetype,
          email: user.email || null,
          userName: user.displayName || 'Anonymous',
          physicalStat: 10,
          mentalStat: 10,
          socialStat: 10,
          practicalStat: 10,
          creativeStat: 10,
          lastLogTimestamp: now,
          createdAt: now,
          level: 0,
          xp: 0,
          unlockedSkills: {},
          momentumFlameActive: true,
          gems: 1,
          streakFreezes: 0,
        },
        { merge: true }
      );
      // Navigate programmatically after initiating the write
      router.push(`/onboarding/welcome?archetype=${archetype}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-2">
          ATLAS
        </h1>
        <p className="text-lg text-foreground/80">Your Life, Reborn.</p>
        <h2 className="font-headline text-3xl md:text-4xl mt-12">
          Choose Your Archetype
        </h2>
        <p className="text-muted-foreground mt-2">
          Your choice defines your starting path.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {archetypes.map(archetype => (
          <ArchetypeCard
            key={archetype.name}
            onSelect={handleSelectArchetype}
            {...archetype}
          />
        ))}
      </div>
    </main>
  );
}

    
