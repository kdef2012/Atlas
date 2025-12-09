
'use client';

import { Suspense, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Globe, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { Guild, SkillCategory } from '@/lib/types';
import { CATEGORY_ICONS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dynamically import the map component to prevent SSR issues with Leaflet
const WorldMap = dynamic(() => import('@/components/map/WorldMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-[60vh] w-full" />,
});

export default function MapPage() {
  const firestore = useFirestore();
  const guildsCollection = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
  const { data: guilds, isLoading } = useCollection<Guild>(guildsCollection);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');

  const filteredGuilds = useMemo(() => {
    if (!guilds) return [];
    return guilds.filter(guild => {
      const nameMatch = guild.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'all' || guild.category === selectedCategory;
      return nameMatch && categoryMatch;
    });
  }, [guilds, searchTerm, selectedCategory]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                    <Globe className="w-8 h-8 text-primary"/>
                    World Map
                </CardTitle>
                <CardDescription>
                  Visualize the global presence of ATLAS guilds and communities.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search guilds..." 
                        className="pl-10 w-full sm:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SkillCategory | 'all')}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.keys(CATEGORY_ICONS).filter(k => !['Challenge', 'Streak', 'Gems', 'Verify', 'Guilds', 'Store', 'Events', 'Radio'].includes(k)).map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 -m-6">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <WorldMap guilds={filteredGuilds} isLoading={isLoading} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
