
'use client';

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gem, Store, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from "@/firebase/provider";
import type { StoreItem } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditStoreItemDialog } from "./EditStoreItemDialog";

export function StoreItemList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const storeItemsCollection = useMemoFirebase(() => collection(firestore, 'store-items'), [firestore]);
    const { data: items, isLoading } = useCollection<StoreItem>(storeItemsCollection);

    const handleDelete = (item: StoreItem) => {
        const itemRef = doc(firestore, 'store-items', item.id);
        deleteDocumentNonBlocking(itemRef);
        toast({
            title: "Item Deleted",
            description: `The item "${item.name}" has been removed from the store.`,
        });
    }

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
                            <TableHead>Preview</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : items?.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover bg-secondary" />
                                    ) : (
                                        <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-md">
                                            <Store className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
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
                                    <EditStoreItemDialog item={item} />
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the item "{item.name}" from the store.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <EditStoreItemDialog>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Item
                    </Button>
                </EditStoreItemDialog>
            </CardFooter>
        </Card>
    );
}
