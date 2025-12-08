
'use client';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function JsonBlock({ title, data }: { title: string, data: any }) {
    return (
        <div>
            <h3 className="font-bold mb-2">{title}</h3>
            <pre className="bg-secondary p-4 rounded-md text-xs overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}

export default function DebugPage() {
    const { user: authUser, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const userRef = useMemoFirebase(() => (authUser ? doc(firestore, 'users', authUser.uid) : null), [firestore, authUser]);
    const { data: userData, isLoading: isUserDocLoading } = useDoc<User>(userRef);

    const isLoading = isAuthLoading || isUserDocLoading;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        <Bug className="w-8 h-8 text-primary" />
                        Debug Panel
                    </CardTitle>
                    <CardDescription>
                        Inspect application state and data in real-time.
                    </CardDescription>
                </CardHeader>
            </Card>

            {isLoading ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Loading Data...</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>User Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <JsonBlock title="Auth User (from useUser)" data={authUser} />
                        <JsonBlock title="Firestore User Document (from useDoc)" data={userData} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
