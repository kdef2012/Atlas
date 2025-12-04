
'use client';

import { ArchetypeCard } from '@/components/onboarding/ArchetypeCard';
import type { Archetype, User as UserType } from '@/lib/types';
import { Bot, Mountain, Zap } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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
  const firestore = useFirestore();
  const router = useRouter();
  const { user: authUser, isUserLoading } = useUser();
  
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: userDoc, isLoading: isUserDocLoading } = useDoc<UserType>(userRef);

  useEffect(() => {
    // If auth has loaded and there's no one logged in, send to login page.
    if (!isUserLoading && !authUser) {
      redirect('/login');
    }
    // If the user document already exists, they have completed onboarding, send to dashboard.
    if (userDoc) {
      redirect('/');
    }
  }, [authUser, isUserLoading, userDoc]);

  const handleSelectArchetype = (archetype: Archetype) => {
    if (authUser) {
      const newUserRef = doc(firestore, 'users', authUser.uid);
      const now = Date.now();
      const userName = authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous';
      
      setDocumentNonBlocking(
        newUserRef,
        {
          id: authUser.uid,
          archetype: archetype,
          email: authUser.email || null,
          userName: userName,
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
          traits: {},
        },
        { merge: true }
      );
      router.push(`/onboarding/customize?archetype=${archetype}`);
    }
  };
  
  if (isUserLoading || isUserDocLoading) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <Skeleton className="w-48 h-16" />
        </main>
      )
  }

  // Render only if user is authenticated but has no user document
  return authUser && !userDoc ? (
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
  ) : null;
}
