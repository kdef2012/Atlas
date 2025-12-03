
'use client';

import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import type { GlobalEvent } from "@/lib/types";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export function AnnouncementBanner() {
    const firestore = useFirestore();
    const [isVisible, setIsVisible] = useState(true);

    const now = Date.now();
    const eventsQuery = useMemoFirebase(() => 
        query(
            collection(firestore, 'events'),
            where('isActive', '==', true),
            where('startAt', '<=', now),
            where('endAt', '>', now),
            where('bannerMessage', '!=', null),
            orderBy('startAt', 'desc'),
            limit(1)
        ),
    [firestore, now]);

    const { data: events, isLoading } = useCollection<GlobalEvent>(eventsQuery);

    const activeEvent = events && events.length > 0 ? events[0] : null;

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

    