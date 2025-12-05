
'use client';

import { ArchetypeCard } from '@/components/onboarding/ArchetypeCard';
import type { Archetype } from '@/lib/types';
import { Bot, Mountain, Zap } from 'lucide-react';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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
  const { toast } = useToast();
  const { user: authUser } = useUser();
  const isAdminLogin = authUser?.email === 'kdef2012@gmail.com';

  useEffect(() => {
      // **CRITICAL FIX**: If the admin user somehow lands here, redirect them immediately.
      if (isAdminLogin) {
          router.replace('/admin');
      }
  }, [isAdminLogin, router]);
  
  const handleSelectArchetype = async (archetype: Archetype) => {
    if (!authUser) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'Please log in or sign up to select an archetype.',
        });
        router.push('/login');
        return;
    }
    
    // This check is now redundant because of the useEffect, but it's good for safety.
    if (isAdminLogin) {
        toast({ title: 'Redirecting to Admin Dashboard...' });
        router.replace('/admin');
        return;
    }
      
    const now = Date.now();
    const userName = authUser.displayName || authUser.email?.split('@')[0] || 'Anonymous';
    
    const newUserRef = doc(firestore, 'users', authUser.uid);
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
        isAdmin: false, 
      },
      { merge: true }
    );
    router.push(`/onboarding/customize?archetype=${archetype}`);
  };
  
  // Don't render the page content if we're about to redirect the admin.
  if (isAdminLogin) {
      return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
       <div className="absolute top-4 right-4 z-20">
        <Button asChild variant="link">
          <Link href="/login">
            Already have an account? Log In
          </Link>
        </Button>
      </div>
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-2 animate-fade-in-slow">
          Choose Your Origin
        </h1>
        <p className="text-muted-foreground">
            Explore the Atlas
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
