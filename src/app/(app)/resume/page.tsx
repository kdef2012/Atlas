
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, doc } from 'firebase/firestore';
import { generateResume, type GenerateResumeOutput } from '@/ai/flows/generate-resume';
import type { User, Skill, Trait } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Wand2, FileText, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function MarkdownRenderer({ content }: { content: string }) {
  const renderContent = () => {
    return content
      .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-4 mb-2 font-headline">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3 border-b pb-2 font-headline">$1</h2>')
      .replace(/# (.*)/g, '<h1 class="text-4xl font-bold mb-4 font-headline">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/(\n<li>.*<\/li>)+/g, (list) => `<ul>${list}</ul>`);
  };

  return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderContent() }} />;
}


function ResumeContent() {
    const [resume, setResume] = useState<GenerateResumeOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const firestore = useFirestore();
    const { user: authUser } = useUser();
    
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);
    
    const skillsCollection = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
    const { data: allSkills, isLoading: areSkillsLoading } = useCollection<Skill>(skillsCollection);

    const traitsCollection = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
    const { data: allTraits, isLoading: areTraitsLoading } = useCollection<Trait>(traitsCollection);

    const handleGenerateResume = async () => {
        if (!user || !allSkills || !allTraits) return;
        setIsLoading(true);
        setError(null);
        setResume(null);

        try {
            const userSkills = Object.entries(user.userSkills || {}).map(([skillId, skillData]) => {
                const skillInfo = allSkills.find(s => s.id === skillId);
                return {
                    name: skillInfo?.name || 'Unknown Skill',
                    category: skillInfo?.category || 'General',
                    xp: skillData.xp,
                };
            });

             const userTraits = Object.keys(user.traits || {}).map(traitId => {
                return allTraits.find(t => t.id === traitId)?.name || traitId;
            });

            const result = await generateResume({
                userName: user.userName,
                archetype: user.archetype,
                level: user.level,
                skills: userSkills,
                traits: userTraits,
            });
            setResume(result);
        } catch (e) {
            console.error(e);
            setError('Failed to generate your resume. The AI might be busy, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && allSkills && allTraits) {
            handleGenerateResume();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, allSkills, allTraits]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
                <head>
                    <title>${user?.userName}'s Resume</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; color: #333; }
                        h1, h2, h3 { color: #111; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 5px; }
                        strong { color: #000; }
                    </style>
                </head>
                <body>
                    ${resume ? document.getElementById('resume-content')?.innerHTML : ''}
                </body>
            </html>
        `);
        printWindow?.document.close();
        printWindow?.print();
    };
    
    const pageIsLoading = isUserLoading || areSkillsLoading || areTraitsLoading;

    if (pageIsLoading) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                     <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" />
                        Your Live Resume
                    </CardTitle>
                    <CardDescription>
                        A dynamic resume generated from your ATLAS accomplishments.
                    </CardDescription>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline" disabled={!resume || isLoading}><Download className="mr-2"/>Print</Button>
                    <Button onClick={handleGenerateResume} disabled={isLoading}><Wand2 className="mr-2"/>Regenerate</Button>
                 </div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-center p-12 bg-secondary/30 rounded-lg"
                    >
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="font-semibold">The AI is crafting your resume...</p>
                        <p className="text-sm text-muted-foreground">This may take a moment.</p>
                    </motion.div>
                )}

                {error && (
                     <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center p-12 bg-destructive/20 text-destructive-foreground rounded-lg"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}

                {resume && !isLoading && (
                    <motion.div
                        key="resume"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.2 }}
                        id="resume-content"
                    >
                        <MarkdownRenderer content={resume.markdownContent} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


export default function ResumePage() {
    return (
        <Card>
            <CardHeader>
               
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <ResumeContent />
                </Suspense>
            </CardContent>
        </Card>
    )
}
