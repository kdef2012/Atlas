
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SubmissionCard } from "@/components/verify/SubmissionCard";
import { CATEGORY_ICONS } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Query for unverified logs that have a photo
  const unverifiedLogsQuery = useMemoFirebase(() => 
    query(
      collectionGroup(firestore, 'logs'), 
      where('isVerified', '==', false),
      where('verificationPhotoUrl', '!=', ''),
      limit(10) // Limit to 10 to prevent fetching too many at once
    ), [firestore]);

  const { data: logs, isLoading: isLoadingLogs } = useCollection<Log>(unverifiedLogsQuery);

  useEffect(() => {
    async function fetchSubmissionDetails() {
      if (logs) {
        setIsLoading(true);
        const detailedSubmissions: Submission[] = [];

        for (const log of logs) {
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
        setSubmissions(detailedSubmissions);
        setIsLoading(false);
      }
    }

    fetchSubmissionDetails();
  }, [logs, firestore]);

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
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
