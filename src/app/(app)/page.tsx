import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TwinskieAvatar } from "@/components/dashboard/TwinskieAvatar";
import { StatsRadarChart, StatsRadarChartSkeleton } from "@/components/dashboard/StatsRadarChart";
import { LogActivityForm } from "@/components/dashboard/LogActivityForm";
import { QuestCard } from "@/components/dashboard/QuestCard";
import { FireteamStatus } from "@/components/dashboard/FireteamStatus";
import { FirstQuest } from '@/components/dashboard/FirstQuest';

export default function DashboardPage() {
  // Mock data for now
  const user = {
    dominantCategory: 'Physical',
    lastLogTimestamp: Date.now() - (12 * 60 * 60 * 1000) // 12 hours ago
  };

  const isInactive = (Date.now() - user.lastLogTimestamp) > (24 * 60 * 60 * 1000);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-headline text-3xl">The Twinskie</CardTitle>
            <CardDescription>Your digital self.</CardDescription>
          </CardHeader>
          <TwinskieAvatar dominantCategory={user.dominantCategory} isInactive={isInactive} />
        </Card>
        <FireteamStatus />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Core Energies</CardTitle>
            <CardDescription>A reflection of your life's balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<StatsRadarChartSkeleton />}>
              <StatsRadarChart />
            </Suspense>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Log Activity</CardTitle>
                    <CardDescription>What have you accomplished?</CardDescription>
                </CardHeader>
                <CardContent>
                    <LogActivityForm />
                </CardContent>
            </Card>

            <div className="space-y-6">
              <FirstQuest />
              <QuestCard 
                quest={{ 
                  id: 'q2', 
                  name: 'Pioneer: First Steps', 
                  description: 'Log a new, unique skill that doesn\'t exist in the ATLAS yet.',
                  category: 'Creative',
                  isCompleted: false
                }}
              />
               <QuestCard 
                quest={{ 
                  id: 'q3', 
                  name: 'Social Bond', 
                  description: 'Join or create a Fireteam.',
                  category: 'Social',
                  isCompleted: false
                }}
              />
            </div>
        </div>
      </div>
    </div>
  );
}
