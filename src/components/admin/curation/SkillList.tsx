
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { Skill } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, ShieldAlert, Loader2, BookOpen } from "lucide-react";
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
import { generateSkillGuide } from '@/ai/flows/generate-skill-guide';

export function SkillList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

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

    const handleApprove = async (skill: Skill) => {
        setIsProcessing(skill.id);
        const skillRef = doc(firestore, 'skills', skill.id);

        try {
            // 1. Mark as approved
            updateDocumentNonBlocking(skillRef, { isApproved: true });
            
            toast({
                title: "Skill Authorized!",
                description: `"${skill.name}" is now part of the global Nebula. Authoring guide...`,
            });

            // 2. Generate AI Guide for the Rolodex
            const result = await generateSkillGuide({
                skillName: skill.name,
                category: skill.category,
                description: skill.description || 'A newly discovered discipline.'
            });

            updateDocumentNonBlocking(skillRef, { guide: result.guideMarkdown });

            toast({
                title: "Guide Chronicled!",
                description: `The ATLAS Guide for "${skill.name}" has been added to the Rolodex.`,
            });

        } catch (error) {
            console.error("Approval error:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to authorize skill or author guide."
            });
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skill Management & Rolodex Curation</CardTitle>
                <CardDescription>Review and authorize user-pioneered skills to add them to the global library.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Skill Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
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
                        {skills?.map(skill => (
                            <TableRow key={skill.id}>
                                <TableCell>
                                    <div className="font-medium">{skill.name}</div>
                                    <div className="text-xs text-muted-foreground">ID: {skill.id}</div>
                                </TableCell>
                                <TableCell>
                                     <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[skill.category] }}></div>
                                        {skill.category}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {skill.isApproved ? (
                                        <span className="text-xs font-bold text-green-500 flex items-center gap-1 uppercase tracking-tighter">
                                            <CheckCircle className="w-3 h-3" /> Approved
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-yellow-500 flex items-center gap-1 uppercase tracking-tighter">
                                            <ShieldAlert className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {!skill.isApproved && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleApprove(skill)}
                                            disabled={isProcessing === skill.id}
                                        >
                                            {isProcessing === skill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                            Authorize
                                        </Button>
                                    )}
                                    {skill.isApproved && !skill.guide && (
                                        <Button 
                                            variant="outline"
                                            size="sm" 
                                            onClick={() => handleApprove(skill)}
                                            disabled={isProcessing === skill.id}
                                        >
                                            {isProcessing === skill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1" />}
                                            Author Guide
                                        </Button>
                                    )}
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
                                                    This will permanently delete the skill "{skill.name}" and remove its guide from the Rolodex.
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
