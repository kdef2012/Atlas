'use client';

import { useCollection, useMemoFirebase, useUser } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, limit } from "firebase/firestore";
import type { GlobalEvent } from "@/lib/types";
import { AlertCircle, X } from "lucide-react";
import { useState, useMemo } from "react";

export function AnnouncementBanner() {
    const firestore = useFirestore();
    const { user } = useUser(); // ✅ ADD THIS
    const [isVisible, setIsVisible] = useState(true);

    // ✅ Only create query if user exists (or for public events, just check if firestore is ready)
    const eventsQuery = useMemoFirebase(() => 
        // Since events are public (allow list: if true), we can query them
        // But let's add a check to be safe
        firestore ? query(
            collection(firestore, 'events'),
            where('isActive', '==', true),
            where('hasBanner', '==', true),
            limit(5)
        ) : null,
    [firestore]);

    const { data: events, isLoading } = useCollection<GlobalEvent>(eventsQuery);

    const activeEvent = useMemo(() => {
        if (!events) return null;
        const now = Date.now();
        // Sort on the client side
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
