
'use client';

import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { GuildList } from '@/components/admin/curation/GuildList';
import { SkillList } from '@/components/admin/curation/SkillList';
import { Palette } from 'lucide-react';

function CurationDashboardContent() {
  return (
    <div className="space-y-6">
        <SkillList />
        <GuildList />
    </div>
  );
}

export default function CurationPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        <Palette className="w-8 h-8 text-primary" />
                        Content Curation
                    </CardTitle>
                    <CardDescription>
                        Manage user-pioneered skills and their associated guilds to maintain a high-quality experience.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <CurationDashboardContent />
            </Suspense>
        </div>
    )
}
