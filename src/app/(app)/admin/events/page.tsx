
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        <Megaphone className="w-8 h-8 text-primary" />
                        Global Event Broadcaster
                    </CardTitle>
                    <CardDescription>
                        Create and manage limited-time events for the entire ATLAS community.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Event</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                    <p className="text-center text-muted-foreground mt-4">Event creation form coming soon.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Active & Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[100px] w-full" />
                     <p className="text-center text-muted-foreground mt-4">Event list coming soon.</p>
                </CardContent>
            </Card>
        </div>
    )
}
