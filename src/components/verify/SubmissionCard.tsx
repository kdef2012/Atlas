
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import type { Log, Skill, User } from '@/lib/types';

interface Submission {
    log: Partial<Log>;
    skill: Partial<Skill>;
    user: Partial<User>;
}

interface SubmissionCardProps {
    submission: Submission;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
    const { log, skill, user } = submission;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center">Does this count as "{skill.name || 'Unknown Skill'}"?</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-dashed">
                    {log.verificationPhotoUrl ? (
                        <Image
                            src={log.verificationPhotoUrl}
                            alt={`Proof for ${skill.name}`}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No image provided</p>
                        </div>
                    )}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Submitted by {user.userName || 'Anonymous'}
                </p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
                <Button variant="destructive" size="lg">
                    <X className="mr-2" />
                    Fail
                </Button>
                <Button variant="default" size="lg" className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-2" />
                    Pass
                </Button>
            </CardFooter>
        </Card>
    );
}
