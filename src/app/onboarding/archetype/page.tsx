
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
  bonus: string;
  icon: React.ReactNode;
}[] = [
  {
    name: 'Titan',
    description: 'The path of physical mastery and strength.',
    bonus: '+10% Strength XP',
    icon: <Mountain className="h-12 w-12" />,
  },
  {
    name: 'Sage',
    description: 'The path of intellectual pursuit and knowledge.',
    bonus: '+10% Intellect XP',
    icon: <Bot className="h-12 w-12" />,
  },
  {
    name: 'Maverick',
    description: 'The path of innovative spirit and unbound creativity.',
    bonus: '+10% Charisma XP',
    icon: <Zap className="h-12 w-12" />,
  },
];

export default function ArchetypeSelectionPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  const handleSelectArchetype = (archetype: Archetype) => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const now = Date.now();
      // Base stats are set to a non-zero but low value to make the chart visible but still look "pathetic".
      setDocumentNonBlocking(
        userRef,
        {
          id: user.uid,
          archetype: archetype,
          email: user.email || null,
          userName: user.displayName || 'Anonymous',
          physicalStat: 5,
          mentalStat: 5,
          socialStat: 5,
          practicalStat: 5,
          creativeStat: 5,
          lastLogTimestamp: now,
          createdAt: now,
          level: 0,
          xp: 0,
          userSkills: {},
          avatarLayers: {},
          momentumFlameActive: true,
          gems: 0,
          streakFreezes: 0,
        },
        { merge: true }
      );
      router.push(`/onboarding/customize?archetype=${archetype}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-2 animate-fade-in-slow">
          Choose Your Origin
        </h1>
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
       <style jsx>{`
        @keyframes fade-in-slow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 2s ease-in-out;
        }
      `}</style>
    </main>
  );
}
