
'use client';
import { useSearchParams } from 'next/navigation';
import { QuestCard } from '@/components/dashboard/QuestCard';


export function FirstQuest() {
    const searchParams = useSearchParams();
    const firstQuestCompleted = searchParams.get('first_quest_complete') === 'true';

    if (firstQuestCompleted) {
        return (
            <QuestCard
                quest={{
                    id: 'q1',
                    name: 'A New Beginning',
                    description: 'You\'ve taken your first step into a larger world.',
                    category: 'Intro',
                    isCompleted: true,
                }}
            />
        );
    }
    return null;
}
