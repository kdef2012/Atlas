
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Archetype } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface ArchetypeCardProps {
  name: Archetype;
  description: string;
  icon: React.ReactNode;
  onSelect: (archetype: Archetype) => void;
}

export function ArchetypeCard({ name, description, icon, onSelect }: ArchetypeCardProps) {
  return (
    <Card className="bg-card border-primary/20 hover:border-primary hover:shadow-primary/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
      <CardHeader className="items-center text-center">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline text-2xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <div className="p-6 pt-0">
        <Button className="w-full font-bold bg-primary hover:bg-primary/90 group" onClick={() => onSelect(name)}>
          Select {name}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
}
