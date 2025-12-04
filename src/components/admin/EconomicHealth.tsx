
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Gem } from 'lucide-react';
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import type { User, StoreItem } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function EconomicHealth() {
    const firestore = useFirestore();

    const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

    const storeItemsCollection = useMemoFirebase(() => collection(firestore, 'store-items'), [firestore]);
    const { data: storeItems, isLoading: itemsLoading } = useCollection<StoreItem>(storeItemsCollection);

    const isLoading = usersLoading || itemsLoading;

    const { totalGems, totalItemsOwned, itemPopularity } = useMemo(() => {
        if (!users || !storeItems) {
            return { totalGems: 0, totalItemsOwned: 0, itemPopularity: [] };
        }

        const totalGems = users.reduce((sum, user) => sum + (user.gems || 0), 0);
        
        const itemCounts: Record<string, number> = {};
        let totalItemsOwned = 0;

        users.forEach(user => {
            if (user.avatarLayers) {
                Object.keys(user.avatarLayers).forEach(layerKey => {
                    if (user.avatarLayers?.[layerKey]) {
                        itemCounts[layerKey] = (itemCounts[layerKey] || 0) + 1;
                        totalItemsOwned++;
                    }
                });
            }
        });
        
        const itemPopularity = storeItems
            .map(item => ({
                name: item.name,
                count: itemCounts[item.layerKey] || 0,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5

        return { totalGems, totalItemsOwned, itemPopularity };
    }, [users, storeItems]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-accent" />
                    Economic Health
                </CardTitle>
                <CardDescription>An overview of the in-game economy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Gems in Circulation</span>
                        {isLoading ? <Skeleton className="h-5 w-16" /> : <span className="font-bold">{totalGems.toLocaleString()}</span>}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total Items Owned</span>
                        {isLoading ? <Skeleton className="h-5 w-12" /> : <span className="font-bold">{totalItemsOwned.toLocaleString()}</span>}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-2">Most Popular Items</h4>
                     {isLoading ? (
                        <Skeleton className="h-40 w-full" />
                     ) : (
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={itemPopularity} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    width={80}
                                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0,10)}...` : value}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--secondary))' }}
                                    contentStyle={{ 
                                        background: 'hsl(var(--background))', 
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
