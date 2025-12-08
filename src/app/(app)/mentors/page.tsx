
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import type { User, Skill, Mentorship } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookUser, Send, Check } from 'lucide-react';
import { TwinskieAvatarCompact } from '@/components/TwinskiAvatarCompact';
import { useToast } from '@/hooks/use-toast';

function MentorListPage() {
    const searchParams = useSearchParams();
    const skillId = searchParams.get('skillId');
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();

    const skillRef = useMemoFirebase(() => skillId ? doc(firestore, 'skills', skillId) : null, [firestore, skillId]);
    const { data: skill, isLoading: isSkillLoading } = useDoc<Skill>(skillRef);
    
    // Find users who have this skill unlocked
    const mentorsQuery = useMemoFirebase(() => {
        if (!skillId) return null;
        return query(collection(firestore, 'users'), where(`userSkills.${skillId}.isUnlocked`, '==', true));
    }, [firestore, skillId]);

    const { data: mentors, isLoading: areMentorsLoading } = useCollection<User>(mentorsQuery);
    
    // Find existing mentorship requests made by the current user for this skill
    const existingRequestsQuery = useMemoFirebase(() => {
        if (!skillId || !authUser) return null;
        return query(collection(firestore, 'mentorships'), where('skillId', '==', skillId), where('menteeId', '==', authUser.uid));
    }, [firestore, skillId, authUser]);

    const { data: existingRequests, isLoading: areRequestsLoading } = useCollection<Mentorship>(existingRequestsQuery);
    
    const isLoading = isSkillLoading || areMentorsLoading || areRequestsLoading;

    const handleRequestMentorship = async (mentor: User) => {
        if (!authUser || !skillId) return;

        const mentorshipData: Omit<Mentorship, 'id'> = {
            mentorId: mentor.id,
            menteeId: authUser.uid,
            skillId: skillId,
            status: 'pending',
            createdAt: Date.now(),
        };
        
        const mentorshipsCollection = collection(firestore, 'mentorships');
        addDocumentNonBlocking(mentorshipsCollection, mentorshipData);

        toast({
            title: 'Request Sent!',
            description: `Your request to be mentored by ${mentor.userName} for "${skill?.name}" has been sent.`,
        });
    };
    
    if (!skillId) {
        return <p className="text-center text-muted-foreground">Select a skill from the Nebula to find a mentor.</p>;
    }
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        )
    }

    const potentialMentors = mentors?.filter(m => m.id !== authUser?.uid) || [];
    const pendingMentorIds = new Set(existingRequests?.map(r => r.mentorId));


    return (
        <div className="space-y-4">
            {potentialMentors.length > 0 ? potentialMentors.map(mentor => {
                const isPending = pendingMentorIds.has(mentor.id);
                return (
                    <Card key={mentor.id} className="flex items-center p-4 gap-4">
                        <TwinskieAvatarCompact user={mentor} size={48} showInactive={false} />
                        <div className="flex-1">
                            <p className="font-bold">{mentor.userName}</p>
                            <p className="text-sm text-muted-foreground">Level {mentor.level} {mentor.archetype}</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => handleRequestMentorship(mentor)}
                            disabled={isPending}
                        >
                            {isPending ? <Check className="mr-2" /> : <Send className="mr-2" />}
                            {isPending ? 'Request Sent' : 'Request'}
                        </Button>
                    </Card>
                )
            }) : (
                 <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No mentors found for "{skill?.name}".</p>
                    <p className="text-sm mt-2">You may be the first to master it here!</p>
                </div>
            )}
        </div>
    )
}

export default function MentorsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                    <BookUser className="w-8 h-8 text-primary" />
                    Find a Mentor
                </CardTitle>
                <CardDescription>
                    Connect with experienced users to guide you on your journey.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                    <MentorListPage />
                </Suspense>
            </CardContent>
        </Card>
    )
}
