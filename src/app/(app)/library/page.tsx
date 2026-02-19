
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where } from 'firebase/firestore';
import type { Skill, SkillCategory } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Library, Search, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

function SkillLibraryCard({ skill }: { skill: Skill }) {
    const Icon = CATEGORY_ICONS[skill.category] || BookOpen;
    const color = CATEGORY_COLORS[skill.category];

    return (
        <Link href={`/library/${skill.id}`}>
            <Card className="h-full hover:border-primary/50 transition-all group hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${color.replace(')', ' / 0.1)')}`, color: color }}
                    >
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{skill.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">{skill.category}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">
                        "{skill.description}"
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-accent" />
                            Guide Available
                        </span>
                        <span className="flex items-center gap-1 group-hover:text-primary">
                            Enter Archive <ChevronRight className="w-3 h-3" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function LibraryPage() {
    const firestore = useFirestore();
    const [search, setSearch] = useState('');

    const skillsQuery = useMemoFirebase(() => 
        query(collection(firestore, 'skills'), where('isApproved', '==', true)),
        [firestore]
    );
    const { data: skills, isLoading } = useCollection<Skill>(skillsQuery);

    const filteredSkills = useMemo(() => {
        if (!skills) return [];
        return skills.filter(s => 
            s.name.toLowerCase().includes(search.toLowerCase()) || 
            s.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [skills, search]);

    return (
        <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <Library className="w-10 h-10 text-primary" />
                        <CardTitle className="font-headline text-4xl">The Nebula Rolodex</CardTitle>
                    </div>
                    <CardDescription className="text-lg max-w-2xl">
                        A decentralized library of human potential. Browse disciplines pioneered by the community and learn how to begin your own mastery journey.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search archives by name or category..." 
                            className="pl-10 h-12 bg-background/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            ) : filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSkills.map(skill => (
                        <SkillLibraryCard key={skill.id} skill={skill} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-secondary/10">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <h3 className="text-xl font-bold font-headline">Archive Signal Missing</h3>
                    <p className="text-muted-foreground">No disciplines found matching your search. Pioneer something new to expand the library!</p>
                </div>
            )}
        </div>
    );
}
