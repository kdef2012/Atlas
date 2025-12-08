
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SubmissionCard } from "@/components/verify/SubmissionCard";
import { CATEGORY_ICONS } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collectionGroup, query, where, limit, getDoc, doc } from "firebase/firestore";
import type { Log, Skill, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface Submission {
    log: Log;
    skill: Skill;
    user: User;
}

export default function VerifyPage() {
  const VerifyIcon = CATEGORY_ICONS['Verify'];
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query for unverified logs that have a photo.
  // We can't filter out the current user's logs here because Firestore
  // does not allow two '!=' or 'not-in' filters in the same query.
  // We will filter them out on the client side.
  const unverifiedLogsQuery = useMemoFirebase(() => {
    if (!authUser) return null; // CRITICAL FIX: Do not run query until user is authenticated
    return query(
      collectionGroup(firestore, 'logs'), 
      where('isVerified', '==', false),
      where('verificationPhotoUrl', '!=', ''),
      limit(20) // Fetch a bit more to account for client-side filtering
    )
  }, [firestore, authUser]);

  const { data: logs, isLoading: isLoadingLogs } = useCollection<Log>(unverifiedLogsQuery);

  useEffect(() => {
    async function fetchSubmissionDetails() {
      if (logs && authUser) {
        setIsLoading(true);
        const detailedSubmissions: Submission[] = [];

        // Filter out the current user's own logs on the client.
        const filteredLogs = logs.filter(log => log.userId !== authUser.uid);

        for (const log of filteredLogs) {
          try {
            const skillRef = doc(firestore, 'skills', log.skillId);
            const userRef = doc(firestore, 'users', log.userId);

            const skillSnap = await getDoc(skillRef);
            const userSnap = await getDoc(userRef);

            if (skillSnap.exists() && userSnap.exists()) {
              detailedSubmissions.push({
                log: log,
                skill: skillSnap.data() as Skill,
                user: userSnap.data() as User
              });
            }
          } catch (error) {
            console.error("Error fetching submission details:", error);
          }
        }
        setSubmissions(detailedSubmissions.slice(0, 10)); // Limit to 10 after processing
        setIsLoading(false);
      } else if (!isLoadingLogs) {
        // If logs are done loading and are null/empty
        setSubmissions([]);
        setIsLoading(false);
      }
    }

    fetchSubmissionDetails();
  }, [logs, firestore, authUser, isLoadingLogs]);

  const handleVote = (logId: string) => {
    // Remove the voted submission from the local state to show the next one
    setSubmissions(prev => prev.filter(s => s.log.id !== logId));
  };
  
  const currentSubmission = submissions.length > 0 ? submissions[0] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <VerifyIcon className="w-8 h-8 text-primary"/>
            Verify Proof-of-Work
        </CardTitle>
        <CardDescription>
          Help maintain the integrity of ATLAS. Review submissions from other users and earn rewards for your judgment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-2xl mx-auto">
            {isLoading || isLoadingLogs ? (
                <div className="space-y-4">
                    <Skeleton className="h-96 w-full"/>
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : currentSubmission ? (
                <SubmissionCard submission={currentSubmission} onVote={handleVote} />
            ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No submissions are currently awaiting verification.</p>
                    <p className="text-sm mt-2">Check back later to help validate the community's achievements.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
