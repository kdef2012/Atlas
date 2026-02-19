
'use client';

import { useDoc, useMemoFirebase, useUser } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { Skill, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, BookOpen, Share2, Sparkles, ChevronRight, Badge } from 'lucide-react';
import { AchievementShare } from '@/components/library/AchievementShare';

function MarkdownRenderer({ content }: { content: string }) {
  const renderContent = () => {
    return content
      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b border-primary/20 pb-2 font-headline text-primary">$1</h2>')
      .replace(/# (.*)/g, '<h1 class="text-4xl font-bold mb-6 font-headline">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.*)/gm, '<li class="ml-4 list-disc mb-2">$1</li>')
      .replace(/(\n<li>.*<\/li>)+/g, (list) => `<ul class="space-y-1 my-4">${list}</ul>`);
  };

  return <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: renderContent() }} />;
}

export default function SkillGuidePage({ params }: { params: { skillId: string } }) {
    const { skillId } = params;
    const firestore = useFirestore();
    const { user: authUser } = useUser();

    const skillRef = useMemoFirebase(() => doc(firestore, 'skills', skillId), [firestore, skillId]);
    const { data: skill, isLoading: isSkillLoading } = useDoc<Skill>(skillRef);

    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

    const isLoading = isSkillLoading || isUserLoading;

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (!skill) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold font-headline">Archive Entry Lost</h2>
                <p className="text-muted-foreground mt-2">This skill has not yet been chronicled in the Nebula.</p>
                <Button asChild className="mt-6" variant="outline">
                    <Link href="/library"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Rolodex</Link>
                </Button>
            </div>
        );
    }

    const Icon = CATEGORY_ICONS[skill.category] || BookOpen;
    const color = CATEGORY_COLORS[skill.category];
    const isPioneer = user && skill.pioneerUserId === user.id;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-primary">
                    <Link href="/library">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Rolodex
                    </Link>
                </Button>
                <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Entry
                </Button>
            </div>

            <Card className="border-primary/20 overflow-hidden">
                <div 
                    className="h-32 w-full opacity-20"
                    style={{ backgroundColor: color, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
                <CardHeader className="relative -mt-16 px-8">
                    <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-4 border-2 border-background"
                        style={{ backgroundColor: color, color: 'white' }}
                    >
                        <Icon className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{skill.category}</span>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase">ARCHIVE_ID: {skill.id}</span>
                        </div>
                        <CardTitle className="font-headline text-5xl">{skill.name}</CardTitle>
                        <CardDescription className="text-lg mt-2 italic">
                            Originally Pioneered by Citizen {skill.pioneerUserId.substring(0, 8)}...
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-12">
                    {skill.guide ? (
                        <MarkdownRenderer content={skill.guide} />
                    ) : (
                        <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed">
                            <Sparkles className="w-12 h-12 mx-auto text-primary opacity-30 animate-pulse mb-4" />
                            <h3 className="font-bold">Guide Still Calibrating</h3>
                            <p className="text-sm text-muted-foreground mt-2">The Head Librarian is currently authoring the official Initiate's Guide for this skill. Check back in a few moments.</p>
                        </div>
                    )}

                    {/* Feature 3: Achievement Sharing for Pioneer */}
                    {isPioneer && user && (
                      <AchievementShare user={user} skill={skill} />
                    )}
                </CardContent>
            </Card>

            <section className="bg-primary/5 border border-primary/10 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold font-headline mb-2 text-primary">Ready to begin this Mastery?</h3>
                <p className="text-muted-foreground mb-6">Log your first activity in this discipline to begin your evolution.</p>
                <Button asChild size="lg" className="font-bold group">
                    <Link href="/dashboard">
                        Log "{skill.name}"
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </section>
        </div>
    );
}
