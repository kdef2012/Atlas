'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestCard } from '@/components/dashboard/QuestCard';
import { useUser } from '@/firebase';

function FirstQuestContent() {
    const searchParams = useSearchParams();
    const { user: authUser } = useUser();
    const firstQuestCompleted = searchParams.get('first_quest_complete') === 'true';

    if (firstQuestCompleted && authUser) {
        return (
            <QuestCard
                quest={{
                    id: 'q1',
                    name: 'A New Beginning',
                    description: 'You\'ve taken your first step into a larger world.',
                    category: 'Intro',
                    isCompleted: true,
                    userId: authUser.uid,
                }}
            />
        );
    }
    return null;
}

export function FirstQuest() {
    return (
        <Suspense fallback={null}>
            <FirstQuestContent />
        </Suspense>
    );
}
