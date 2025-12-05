
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
