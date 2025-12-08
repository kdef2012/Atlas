
'use client';

import { useCollection, useMemoFirebase, useUser } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, limit } from "firebase/firestore";
import type { GlobalEvent } from "@/lib/types";
import { AlertCircle, X } from "lucide-react";
import { useState, useMemo } from "react";

export function AnnouncementBanner() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [isVisible, setIsVisible] = useState(true);

    const eventsQuery = useMemoFirebase(() => {
        // Only attempt to query if the user is authenticated, to prevent initial load errors.
        if (!user) return null;
        
        return query(
            collection(firestore, 'events'),
            where('isActive', '==', true),
            where('hasBanner', '==', true),
            limit(5)
        );
    }, [firestore, user]);

    const { data: events, isLoading } = useCollection<GlobalEvent>(eventsQuery);

    const activeEvent = useMemo(() => {
        if (!events) return null;
        const now = Date.now();
        // The sort is important to ensure we get the most recently created event if multiple are active.
        const sortedEvents = events.sort((a, b) => b.startAt - a.startAt);
        return sortedEvents.find(event => event.startAt <= now && event.endAt > now) || null;
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
