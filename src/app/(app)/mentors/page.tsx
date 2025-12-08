
'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import type { User, Skill, Mentorship } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookUser, Send, Check, X, Users, GitPullRequest, CircleCheck } from 'lucide-react';
import { TwinskieAvatarCompact } from '@/components/TwinskiAvatarCompact';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function MentorFinder() {
    const searchParams = useSearchParams();
    const skillId = searchParams.get('skillId');
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();

    const skillRef = useMemoFirebase(() => skillId ? doc(firestore, 'skills', skillId) : null, [firestore, skillId]);
    const { data: skill, isLoading: isSkillLoading } = useDoc<Skill>(skillRef);
    
    const mentorsQuery = useMemoFirebase(() => {
        if (!skillId) return null;
        return query(collection(firestore, 'users'), where(`userSkills.${skillId}.isUnlocked`, '==', true));
    }, [firestore, skillId]);

    const { data: mentors, isLoading: areMentorsLoading } = useCollection<User>(mentorsQuery);
    
    const existingRequestsQuery = useMemoFirebase(() => {
        if (!skillId || !authUser) return null;
        return query(collection(firestore, 'mentorships'), where('skillId', '==', skillId), where('menteeId', '==', authUser.uid));
    }, [firestore, skillId, authUser]);

    const { data: existingRequests, isLoading: areRequestsLoading } = useCollection<Mentorship>(existingRequestsQuery);
    
    const isLoading = isSkillLoading || areMentorsLoading || areRequestsLoading;

    const handleRequestMentorship = async (mentor: User) => {
        if (!authUser || !skillId) return;

        const mentorshipsCollection = collection(firestore, 'mentorships');
        addDocumentNonBlocking(mentorshipsCollection, {
            mentorId: mentor.id,
            menteeId: authUser.uid,
            skillId: skillId,
            status: 'pending',
            createdAt: Date.now(),
        });

        toast({
            title: 'Request Sent!',
            description: `Your request to be mentored by ${mentor.userName} for "${skill?.name}" has been sent.`,
        });
    };
    
    if (!skillId) {
        return (
             <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Select a skill from the Nebula to find a mentor.</p>
             </div>
        )
    }
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
        )
    }

    const potentialMentors = mentors?.filter(m => m.id !== authUser?.uid) || [];
    const pendingMentorIds = new Set(existingRequests?.filter(r => r.status === 'pending').map(r => r.mentorId));

    return (
        <div className="space-y-4">
             <h3 className="font-bold text-lg">Available Mentors for "{skill?.name}"</h3>
            {potentialMentors.length > 0 ? potentialMentors.map(mentor => {
                const isPending = pendingMentorIds.has(mentor.id);
                return (
                    <Card key={mentor.id} className="flex items-center p-4 gap-4">
                        <TwinskieAvatarCompact user={mentor} size={48} />
                        <div className="flex-1">
                            <p className="font-bold">{mentor.userName}</p>
                            <p className="text-sm text-muted-foreground">Level {mentor.level} {mentor.archetype}</p>
                        </div>
                        <Button size="sm" onClick={() => handleRequestMentorship(mentor)} disabled={isPending}>
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

function MentorshipDashboard() {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading } = useUser();
    const { toast } = useToast();

    // Queries for mentorships
    const incomingQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('mentorId', '==', authUser.uid), where('status', '==', 'pending')) : null, [firestore, authUser]);
    const outgoingQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('menteeId', '==', authUser.uid), where('status', '==', 'pending')) : null, [firestore, authUser]);
    const activeAsMentorQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('mentorId', '==', authUser.uid), where('status', '==', 'active')) : null, [firestore, authUser]);
    const activeAsMenteeQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('menteeId', '==', authUser.uid), where('status', '==', 'active')) : null, [firestore, authUser]);

    const { data: incomingRequests, isLoading: loadingIncoming } = useCollection<Mentorship>(incomingQuery);
    const { data: outgoingRequests, isLoading: loadingOutgoing } = useCollection<Mentorship>(outgoingQuery);
    const { data: activeAsMentor, isLoading: loadingMentor } = useCollection<Mentorship>(activeAsMentorQuery);
    const { data: activeAsMentee, isLoading: loadingMentee } = useCollection<Mentorship>(activeAsMenteeQuery);

    // Get all unique user and skill IDs to fetch their data in fewer reads
    const allMentorships = useMemo(() => [
        ...(incomingRequests || []),
        ...(outgoingRequests || []),
        ...(activeAsMentor || []),
        ...(activeAsMentee || [])
    ], [incomingRequests, outgoingRequests, activeAsMentor, activeAsMentee]);

    const userIds = useMemo(() => Array.from(new Set(allMentorships.flatMap(m => [m.mentorId, m.menteeId]))), [allMentorships]);
    const skillIds = useMemo(() => Array.from(new Set(allMentorships.map(m => m.skillId))), [allMentorships]);

    const usersQuery = useMemoFirebase(() => userIds.length > 0 ? query(collection(firestore, 'users'), where('id', 'in', userIds)) : null, [firestore, userIds]);
    const skillsQuery = useMemoFirebase(() => skillIds.length > 0 ? query(collection(firestore, 'skills'), where('id', 'in', skillIds)) : null, [firestore, skillIds]);
    
    const { data: users, isLoading: loadingUsers } = useCollection<User>(usersQuery);
    const { data: skills, isLoading: loadingSkills } = useCollection<Skill>(skillsQuery);

    const usersMap = useMemo(() => new Map(users?.map(u => [u.id, u])), [users]);
    const skillsMap = useMemo(() => new Map(skills?.map(s => [s.id, s])), [skills]);

    const isLoading = isUserLoading || loadingIncoming || loadingOutgoing || loadingMentor || loadingMentee || loadingUsers || loadingSkills;

    const handleUpdateRequest = (mentorshipId: string, newStatus: 'active' | 'denied') => {
        const mentorshipRef = doc(firestore, 'mentorships', mentorshipId);
        updateDocumentNonBlocking(mentorshipRef, { status: newStatus });
        toast({
            title: `Request ${newStatus === 'active' ? 'Accepted' : 'Denied'}`,
            description: "The mentorship status has been updated.",
        });
    };

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><GitPullRequest /> Incoming Requests</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {incomingRequests && incomingRequests.length > 0 ? incomingRequests.map(req => {
                        const mentee = usersMap.get(req.menteeId);
                        const skill = skillsMap.get(req.skillId);
                        return (
                            <Card key={req.id} className="p-3 flex items-center gap-3 bg-secondary">
                                {mentee && <TwinskieAvatarCompact user={mentee} />}
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-bold">{mentee?.userName || '...'}</span> wants to learn <span className="font-bold">{skill?.name || '...'}</span>
                                    </p>
                                </div>
                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleUpdateRequest(req.id, 'denied')}><X className="w-4 h-4"/></Button>
                                <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequest(req.id, 'active')}><Check className="w-4 h-4"/></Button>
                            </Card>
                        )
                    }) : <p className="text-muted-foreground text-sm text-center">No incoming requests.</p>}
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users /> Active Mentorships</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {activeAsMentor && activeAsMentor.length > 0 && (
                        <div>
                            <h4 className="font-bold mb-1">You are mentoring:</h4>
                            {activeAsMentor.map(m => {
                                const mentee = usersMap.get(m.menteeId);
                                const skill = skillsMap.get(m.skillId);
                                return <p key={m.id} className="text-sm"> <span className="font-semibold">{mentee?.userName}</span> in <span className="font-semibold">{skill?.name}</span></p>
                            })}
                        </div>
                    )}
                     {activeAsMentee && activeAsMentee.length > 0 && (
                        <div>
                            <h4 className="font-bold mb-1">You are learning:</h4>
                            {activeAsMentee.map(m => {
                                const mentor = usersMap.get(m.mentorId);
                                const skill = skillsMap.get(m.skillId);
                                return <p key={m.id} className="text-sm"><span className="font-semibold">{skill?.name}</span> from <span className="font-semibold">{mentor?.userName}</span></p>
                            })}
                        </div>
                    )}
                    {(!activeAsMentor || activeAsMentor.length === 0) && (!activeAsMentee || activeAsMentee.length === 0) && <p className="text-muted-foreground text-sm text-center">No active mentorships.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CircleCheck /> Sent Requests</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                     {outgoingRequests && outgoingRequests.length > 0 ? outgoingRequests.map(req => {
                        const mentor = usersMap.get(req.mentorId);
                        const skill = skillsMap.get(req.skillId);
                        return (
                             <Card key={req.id} className="p-3 flex items-center gap-3 bg-secondary/50">
                                {mentor && <TwinskieAvatarCompact user={mentor} />}
                                <div className="flex-1">
                                    <p className="text-sm">
                                        Request to <span className="font-bold">{mentor?.userName || '...'}</span> for <span className="font-bold">{skill?.name || '...'}</span> is pending.
                                    </p>
                                </div>
                            </Card>
                        )
                    }) : <p className="text-muted-foreground text-sm text-center">No pending outgoing requests.</p>}
                </CardContent>
            </Card>
        </div>
    )
}

export default function MentorsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                    <BookUser className="w-8 h-8 text-primary" />
                    Mentorship Hub
                </CardTitle>
                <CardDescription>
                    Connect with users to learn and grow. Find a mentor by visiting the Nebula and selecting a skill.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="dashboard">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="finder">Find a Mentor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dashboard" className="pt-4">
                        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                           <MentorshipDashboard />
                        </Suspense>
                    </TabsContent>
                    <TabsContent value="finder" className="pt-4">
                        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                            <MentorFinder />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
