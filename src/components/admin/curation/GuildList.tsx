
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import type { Guild } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/types";

export function GuildList() {
    const firestore = useFirestore();
    const guildsCollection = useMemoFirebase(() => collection(firestore, 'guilds'), [firestore]);
    const { data: guilds, isLoading } = useCollection<Guild>(guildsCollection);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Guild Management</CardTitle>
                <CardDescription>Oversee all established guilds in the ATLAS system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guild Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-12" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {guilds?.map(guild => (
                            <TableRow key={guild.id}>
                                <TableCell>
                                    <div className="font-medium">{guild.name}</div>
                                </TableCell>
                                <TableCell>
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[guild.category] }}></div>
                                        {guild.category}
                                    </span>
                                </TableCell>
                                <TableCell>{Object.keys(guild.members || {}).length}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" disabled>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" disabled>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
