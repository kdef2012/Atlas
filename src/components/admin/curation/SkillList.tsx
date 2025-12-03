
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { Skill } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/types";
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
import { EditSkillDialog } from "./EditSkillDialog";

export function SkillList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const skillsCollection = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
    const { data: skills, isLoading } = useCollection<Skill>(skillsCollection);

    const handleDelete = (skill: Skill) => {
        const skillRef = doc(firestore, 'skills', skill.id);
        deleteDocumentNonBlocking(skillRef);
        toast({
            title: "Skill Deleted",
            description: `The skill "${skill.name}" has been permanently removed.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skill Management</CardTitle>
                <CardDescription>Review and manage all user-pioneered skills.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Skill Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Total XP</TableHead>
                            <TableHead>Pioneer</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                        {skills?.map(skill => (
                            <TableRow key={skill.id}>
                                <TableCell>
                                    <div className="font-medium">{skill.name}</div>
                                    <div className="text-xs text-muted-foreground">{skill.id}</div>
                                </TableCell>
                                <TableCell>
                                     <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[skill.category] }}></div>
                                        {skill.category}
                                    </span>
                                </TableCell>
                                <TableCell>{skill.xp || 0}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{skill.pioneerUserId}</TableCell>
                                <TableCell className="text-right">
                                    <EditSkillDialog skill={skill} />
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
                                                    This action cannot be undone. This will permanently delete the skill "{skill.name}" and may cause issues for users who have logged this skill.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(skill)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
