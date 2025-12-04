
'use client';

import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, Shield } from "lucide-react";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { UserList } from "@/components/admin/UserList";
import { SuggestionBox } from '@/components/admin/SuggestionBox';
import { Skeleton } from '@/components/ui/skeleton';
import { ArchetypeDistributionChart } from '@/components/admin/ArchetypeDistributionChart';
import { EconomicHealth } from '@/components/admin/EconomicHealth';
import { SuggestionDialog } from '@/components/admin/SuggestionDialog';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';

function AdminDashboardContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <AnalyticsOverview />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <UserList />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <ArchetypeDistributionChart />
        <EconomicHealth />
        <SuggestionBox />
      </div>
    </div>
  );
}

export default function AdminPage() {
    const { user: authUser } = useUser();
    const firestore = useFirestore();
    
    // ✅ Load user document to check admin status
    const userRef = useMemoFirebase(
        () => authUser ? doc(firestore, 'users', authUser.uid) : null,
        [firestore, authUser]
    );
    const { data: userData, isLoading } = useDoc<UserType>(userRef);

    // ✅ Show loading while checking admin status
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            Admin Dashboard
                        </CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                </Card>
                <Skeleton className="h-[500px] w-full" />
            </div>
        );
    }

    // ✅ Check if user is admin (redundant with layout, but ensures components don't mount prematurely)
    if (!userData?.isAdmin) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            Access Denied
                        </CardTitle>
                        <CardDescription>
                            You do not have permission to access this page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    // ✅ Only render components AFTER confirming admin status
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="font-headline text-3xl flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            Admin Dashboard
                        </CardTitle>
                        <CardDescription>
                            Manage users, view analytics, and oversee the ATLAS application.
                        </CardDescription>
                    </div>
                    <SuggestionDialog />
                </CardHeader>
            </Card>
            <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <AdminDashboardContent />
            </Suspense>
        </div>
    );
}
