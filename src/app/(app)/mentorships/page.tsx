
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
             <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-secondary/20">
                <p className="font-headline text-lg uppercase tracking-tighter">Target Signature Required</p>
                <p className="text-sm mt-2">Select a skill from the Nebula clusters to find an available Guardian.</p>
             </div>
        )
    }
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton className="h-20 w-full" />)}
            </div>
        )
    }

    const potentialMentors = mentors?.filter(m => m.id !== authUser?.uid) || [];
    const pendingMentorIds = new Set(existingRequests?.filter(r => r.status === 'pending').map(r => r.mentorId));

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-2xl">Guardians of {skill?.name}</h3>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded border border-accent/20 uppercase font-bold">{potentialMentors.length} Available</span>
             </div>
            {potentialMentors.length > 0 ? potentialMentors.map(mentor => {
                const isPending = pendingMentorIds.has(mentor.id);
                return (
                    <Card key={mentor.id} className="flex items-center p-4 gap-4 bg-card/50 hover:bg-card transition-all border-primary/10">
                        <TwinskieAvatarCompact user={mentor} size={48} />
                        <div className="flex-1">
                            <p className="font-bold text-lg text-primary">{mentor.userName}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Lvl {mentor.level} {mentor.archetype}</p>
                        </div>
                        <Button 
                            size="sm" 
                            variant={isPending ? "outline" : "default"}
                            onClick={() => handleRequestMentorship(mentor)} 
                            disabled={isPending}
                            className="font-bold"
                        >
                            {isPending ? <Check className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                            {isPending ? 'Pending' : 'Request Mastery'}
                        </Button>
                    </Card>
                )
            }) : (
                 <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-secondary/10">
                    <p className="font-headline uppercase">No Guardians Detected</p>
                    <p className="text-sm mt-2">You may be the first to reach enlightenment in this discipline. Forge ahead!</p>
                </div>
            )}
        </div>
    )
}

function MentorshipDashboard() {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading } = useUser();
    const { toast } = useToast();

    const incomingQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('mentorId', '==', authUser.uid), where('status', '==', 'pending')) : null, [firestore, authUser]);
    const outgoingQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('menteeId', '==', authUser.uid), where('status', '==', 'pending')) : null, [firestore, authUser]);
    const activeAsMentorQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('mentorId', '==', authUser.uid), where('status', '==', 'active')) : null, [firestore, authUser]);
    const activeAsMenteeQuery = useMemoFirebase(() => authUser ? query(collection(firestore, 'mentorships'), where('menteeId', '==', authUser.uid), where('status', '==', 'active')) : null, [firestore, authUser]);

    const { data: incomingRequests, isLoading: loadingIncoming } = useCollection<Mentorship>(incomingQuery);
    const { data: outgoingRequests, isLoading: loadingOutgoing } = useCollection<Mentorship>(outgoingQuery);
    const { data: activeAsMentor, isLoading: loadingMentor } = useCollection<Mentorship>(activeAsMentorQuery);
    const { data: activeAsMentee, isLoading: loadingMentee } = useCollection<Mentorship>(activeAsMenteeQuery);

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
            title: `Signal ${newStatus === 'active' ? 'Accepted' : 'Rejected'}`,
            description: "The connection protocol has been updated.",
        });
    };

    if (isLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    }

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4" /> Incoming Transmission
                </h3>
                {incomingRequests && incomingRequests.length > 0 ? (
                    <div className="grid gap-3">
                        {incomingRequests.map(req => {
                            const mentee = usersMap.get(req.menteeId);
                            const skill = skillsMap.get(req.skillId);
                            return (
                                <Card key={req.id} className="p-4 flex items-center gap-4 bg-secondary/30 border-primary/10">
                                    {mentee && <TwinskieAvatarCompact user={mentee} />}
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-bold text-primary">{mentee?.userName || '...'}</span> requests guidance in <span className="font-bold text-accent">{skill?.name || '...'}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleUpdateRequest(req.id, 'denied')}><X className="w-5 h-5"/></Button>
                                        <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateRequest(req.id, 'active')}><Check className="w-5 h-5"/></Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed bg-transparent p-8 text-center text-muted-foreground opacity-50">
                        <p className="text-sm italic">No mentorship requests in queue.</p>
                    </Card>
                )}
            </section>

             <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Active Protocols
                </h3>
                {(activeAsMentor && activeAsMentor.length > 0) || (activeAsMentee && activeAsMentee.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeAsMentor?.map(m => {
                            const mentee = usersMap.get(m.menteeId);
                            const skill = skillsMap.get(m.skillId);
                            return (
                                <Card key={m.id} className="p-4 flex items-center gap-3 border-accent/20 bg-accent/5">
                                    <TwinskieAvatarCompact user={mentee!} size={32} />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight text-accent">Mentoring</p>
                                        <p className="text-sm"> <span className="font-bold">{mentee?.userName}</span> in <span className="font-bold italic">{skill?.name}</span></p>
                                    </div>
                                </Card>
                            )
                        })}
                        {activeAsMentee?.map(m => {
                            const mentor = usersMap.get(m.mentorId);
                            const skill = skillsMap.get(m.skillId);
                            return (
                                <Card key={m.id} className="p-4 flex items-center gap-3 border-primary/20 bg-primary/5">
                                    <TwinskieAvatarCompact user={mentor!} size={32} />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tight text-primary">Learning From</p>
                                        <p className="text-sm"><span className="font-bold italic">{skill?.name}</span> from <span className="font-bold">{mentor?.userName}</span></p>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed bg-transparent p-8 text-center text-muted-foreground opacity-50">
                        <p className="text-sm italic">No active connections. Visit the Nebula to seek or offer guidance.</p>
                    </Card>
                )}
            </section>

            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                    <CircleCheck className="w-4 h-4" /> Outgoing Signals
                </h3>
                {outgoingRequests && outgoingRequests.length > 0 ? (
                    <div className="grid gap-3">
                        {outgoingRequests.map(req => {
                            const mentor = usersMap.get(req.mentorId);
                            const skill = skillsMap.get(req.skillId);
                            return (
                                <Card key={req.id} className="p-4 flex items-center gap-4 bg-secondary/20 border-primary/5">
                                    {mentor && <TwinskieAvatarCompact user={mentor} size={32} />}
                                    <div className="flex-1">
                                        <p className="text-sm italic">
                                            Mastery request to <span className="font-bold">{mentor?.userName || '...'}</span> for <span className="font-bold">{skill?.name || '...'}</span> is currently pending...
                                        </p>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : null}
            </section>
        </div>
    )
}

export default function MentorsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardHeader className="relative z-10 text-center pb-8 border-b bg-secondary/20">
                    <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                        <BookUser className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-4xl mb-2">Guardian Hub</CardTitle>
                    <CardDescription className="max-w-md mx-auto text-lg">
                        Bridge the gap between discovery and mastery. Connect with high-level citizens to evolve faster.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="dashboard" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-muted/50 border-b">
                            <TabsTrigger value="dashboard" className="data-[state=active]:bg-background">Connection Status</TabsTrigger>
                            <TabsTrigger value="finder" className="data-[state=active]:bg-background">Find a Guardian</TabsTrigger>
                        </TabsList>
                        <div className="p-6">
                            <TabsContent value="dashboard" className="mt-0 outline-none">
                                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                                  <MentorshipDashboard />
                                </Suspense>
                            </TabsContent>
                            <TabsContent value="finder" className="mt-0 outline-none">
                                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                                    <MentorFinder />
                                </Suspense>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
