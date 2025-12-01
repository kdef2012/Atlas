import { ArchetypeCard } from '@/components/onboarding/ArchetypeCard';
import type { Archetype } from '@/lib/types';
import { Bot, Mountain, Zap } from 'lucide-react';

const archetypes: { name: Archetype; description: string; icon: React.ReactNode }[] = [
  {
    name: 'Titan',
    description: 'Forge your body into a temple of strength and endurance. The path of physical mastery.',
    icon: <Mountain className="h-12 w-12" />,
  },
  {
    name: 'Sage',
    description: 'Expand your mind and unravel the complexities of the universe. The path of intellectual pursuit.',
    icon: <Bot className="h-12 w-12" />,
  },
  {
    name: 'Maverick',
    description: 'Chart your own course and defy convention with unbound creativity. The path of innovative spirit.',
    icon: <Zap className="h-12 w-12" />,
  },
];

export default function ArchetypeSelectionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-2">ATLAS</h1>
        <p className="text-lg text-foreground/80">Your Life, Reborn.</p>
        <h2 className="font-headline text-3xl md:text-4xl mt-12">Choose Your Archetype</h2>
        <p className="text-muted-foreground mt-2">Your choice defines your starting path.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {archetypes.map((archetype) => (
          <ArchetypeCard key={archetype.name} {...archetype} />
        ))}
      </div>
    </main>
  );
}
