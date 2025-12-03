
'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from 'react';

const COLORS = {
  Titan: '#ef4444', // red-500
  Sage: '#3b82f6',  // blue-600
  Maverick: '#eab308' // yellow-500
};

export function ArchetypeDistributionChart() {
    const firestore = useFirestore();

    const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading } = useCollection<User>(usersCollection);
    
    const chartData = useMemo(() => {
        if (!users) return [];
        const counts = users.reduce((acc, user) => {
            const archetype = user.archetype || 'Unknown';
            acc[archetype] = (acc[archetype] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [users]);


    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Archetype Distribution</CardTitle>
                <CardDescription>A breakdown of user archetypes.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                background: 'hsl(var(--background))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
