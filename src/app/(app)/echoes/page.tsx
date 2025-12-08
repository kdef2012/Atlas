
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { PublicLog, SkillCategory } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

function EchoCard({ echo, index }: { echo: PublicLog, index: number }) {
    const Icon = CATEGORY_ICONS[echo.category as SkillCategory] || MessageSquare;
    const initialDelay = index * 0.1;
    const animationDelay = (index * 0.2) + 2;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: initialDelay }}
            className="w-full"
        >
             <motion.div
                animate={{
                    boxShadow: [
                        '0 0 0px hsl(var(--primary) / 0)',
                        '0 0 15px hsl(var(--primary) / 0.3)',
                        '0 0 0px hsl(var(--primary) / 0)',
                    ],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: animationDelay,
                    ease: 'easeInOut',
                }}
                 className="p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border flex items-center gap-4"
             >
                <div className="p-2 bg-secondary rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-sm">
                        <span className="font-bold text-primary">{echo.skillName}</span> activity detected in <span className="font-semibold">{echo.userRegion}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(echo.timestamp, { addSuffix: true })}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function EchoesPage() {
  const firestore = useFirestore();

  const echoesQuery = useMemoFirebase(() =>
    query(collection(firestore, 'public-logs'), orderBy('timestamp', 'desc'), limit(15)),
    [firestore]
  );
  
  const { data: echoes, isLoading } = useCollection<PublicLog>(echoesQuery);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-4xl flex items-center justify-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    Echoes of the Nebula
                </CardTitle>
                <CardDescription>
                    A real-time, anonymous stream of activities from across the ATLAS.
                </CardDescription>
            </CardHeader>
        </Card>

        {isLoading ? (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        ) : (
             <div className="space-y-3">
                <AnimatePresence>
                    {echoes?.map((echo, index) => (
                        <EchoCard key={echo.id} echo={echo} index={index} />
                    ))}
                </AnimatePresence>
            </div>
        )}
    </div>
  );
}

