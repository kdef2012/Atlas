
'use client';

import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import type { GlobalEvent } from "@/lib/types";
import { AlertCircle, X } from "lucide-react";
import { useState, useMemo } from "react";

export function AnnouncementBanner() {
    const firestore = useFirestore();
    const [isVisible, setIsVisible] = useState(true);

    // Simplified query to only fetch active events with banners
    const eventsQuery = useMemoFirebase(() => 
        query(
            collection(firestore, 'events'),
            where('isActive', '==', true),
            where('bannerMessage', '!=', null),
            orderBy('bannerMessage'), // Firestore requires ordering by the field used in an inequality
            orderBy('startAt', 'desc'),
            limit(5) // Fetch a few recent events to filter on client
        ),
    [firestore]);

    const { data: events, isLoading } = useCollection<GlobalEvent>(eventsQuery);

    // Client-side filtering for the date range
    const activeEvent = useMemo(() => {
        if (!events) return null;
        const now = Date.now();
        // Find the first event that is currently active
        return events.find(event => event.startAt <= now && event.endAt > now) || null;
    }, [events]);


    if (isLoading || !activeEvent || !isVisible) {
        return null;
    }

    return (
        <div className="relative bg-primary text-primary-foreground px-4 py-2 text-center text-sm font-medium">
            <AlertCircle className="inline-block w-4 h-4 mr-2" />
            <span>{activeEvent.bannerMessage}</span>
            <button onClick={() => setIsVisible(false)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20">
                <X className="w-4 h-4" />
                <span className="sr-only">Dismiss</span>
            </button>
        </div>
    );
}
