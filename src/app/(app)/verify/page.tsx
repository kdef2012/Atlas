
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SubmissionCard } from "@/components/verify/SubmissionCard";
import { CATEGORY_ICONS } from "@/lib/types";

export default function VerifyPage() {
  const VerifyIcon = CATEGORY_ICONS['Verify'];

  // Placeholder data - in the next step, we will fetch real data.
  const submissions = [
    {
        log: {
            id: 'log1',
            skillId: 'skill1',
            userId: 'user1',
            verificationPhotoUrl: 'https://picsum.photos/seed/1/600/400',
        },
        skill: {
            id: 'skill1',
            name: 'Gardening'
        },
        user: {
            id: 'user1',
            userName: 'Pioneer123'
        }
    }
  ];

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
            {submissions.length > 0 ? (
                <SubmissionCard submission={submissions[0]} />
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
