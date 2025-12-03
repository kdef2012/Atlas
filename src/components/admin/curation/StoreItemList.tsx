
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gem, Store } from "lucide-react";
import storeItemsData from '@/lib/store-items.json';

// Define a more specific type for our store items
interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    layerKey: string;
}

const items: StoreItem[] = storeItemsData.items as StoreItem[];

export function StoreItemList() {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" /> Store Item Management</CardTitle>
                <CardDescription>Oversee all cosmetic items available for purchase in the store.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{item.name}</div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-semibold">
                                        <Gem className="w-4 h-4 text-accent" />
                                        {item.price}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* Edit and Delete buttons will go here */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
