
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from "@/firebase/provider";
import type { Trait } from '@/lib/types';
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
import { EditTraitDialog } from "./EditTraitDialog";
import { TRAIT_ICONS } from "@/lib/types";


export function TraitList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const traitsCollection = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
    const { data: items, isLoading } = useCollection<Trait>(traitsCollection);

    const handleDelete = (item: Trait) => {
        const itemRef = doc(firestore, 'traits', item.id);
        deleteDocumentNonBlocking(itemRef);
        toast({
            title: "Trait Deleted",
            description: `The trait "${item.name}" has been removed.`,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> Trait Management</CardTitle>
                <CardDescription>Oversee all unlockable traits in the game.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Trait Name</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : items?.map(item => {
                            const Icon = TRAIT_ICONS[item.icon] || Award;
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Icon className="w-4 h-4" />
                                            {item.icon}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditTraitDialog item={item} />
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the trait "{item.name}". This could affect users who have already earned it.
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
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <EditTraitDialog>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Trait
                    </Button>
                </EditTraitDialog>
            </CardFooter>
        </Card>
    );
}
