
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { FileText, XCircle, CheckCircle, Hourglass, Loader2 } from "lucide-react";
import type { Log, Skill, User } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, writeBatch, increment } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
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
import { Badge } from '../ui/badge';

function LogRow({ log, skillsMap, onInvalidate }: { log: Log, skillsMap: Map<string, Skill>, onInvalidate: (log: Log) => void }) {
    const skill = skillsMap.get(log.skillId);

    const getStatus = () => {
        if (log.xp === 0 && log.isVerified) return { text: 'Invalidated', icon: <XCircle className="w-4 h-4 text-destructive" />, color: 'text-destructive' };
        if (log.isVerified) return { text: 'Verified', icon: <CheckCircle className="w-4 h-4 text-green-500" />, color: 'text-green-500' };
        return { text: 'Pending', icon: <Hourglass className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-500' };
    }

    const status = getStatus();
    const canInvalidate = !(log.xp === 0 && log.isVerified);

    return (
        <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
            <div className="flex-1">
                <p className="font-bold">{skill?.name || 'Unknown Skill'}</p>
                <p className="text-sm text-muted-foreground">
                    {format(log.timestamp, 'MMM d, yyyy h:mm a')} - <span className="font-semibold">{log.xp} XP</span>
                </p>
                 <Badge variant="outline" className={status.color}>{status.icon} {status.text}</Badge>
            </div>
            {canInvalidate && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="h-8">Invalidate</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will invalidate the log for "{skill?.name}", nullify the {log.xp} XP gained, and deduct it from the user's total. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onInvalidate(log)} className="bg-destructive hover:bg-destructive/90">Invalidate Log</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}

export function UserLogsDialog({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const logsQuery = useMemoFirebase(
    () => {
        const logsCollection = collection(firestore, `users/${user.id}/logs`);
        return query(logsCollection, orderBy('timestamp', 'desc'), limit(50));
    },
    [firestore, user.id]
  );
  const { data: logs, isLoading: isLoadingLogs } = useCollection<Log>(logsQuery);
  
  const skillsCollection = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const { data: skills, isLoading: isLoadingSkills } = useCollection<Skill>(skillsCollection);

  const skillsMap = useMemo(() => {
    if (!skills) return new Map<string, Skill>();
    return new Map(skills.map(s => [s.id, s]));
  }, [skills]);
  
  const handleInvalidate = async (log: Log) => {
    const batch = writeBatch(firestore);
    const userRef = doc(firestore, 'users', log.userId);
    const logRef = doc(firestore, `users/${log.userId}/logs`, log.id);

    // Deduct XP from user's total
    batch.update(userRef, { xp: increment(-log.xp) });

    // Nullify XP on the log and mark as verified (to remove from queues)
    batch.update(logRef, { xp: 0, isVerified: true });
    
    try {
        await batch.commit();
        toast({
            title: "Log Invalidated",
            description: `The log has been successfully invalidated and ${log.xp} XP was deducted from the user.`,
        });
    } catch (error) {
        console.error("Failed to invalidate log:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not invalidate the log."});
    }
  };

  const isLoading = isLoadingLogs || isLoadingSkills;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
            <FileText className="h-4 w-4"/>
            <span className="sr-only">View Logs</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Activity Logs for {user.userName}</DialogTitle>
          <DialogDescription>
            Review the user's most recent 50 activities. You can invalidate any entry if necessary.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4">
            <div className="space-y-2">
                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                ) : logs && logs.length > 0 ? (
                    logs.map(log => <LogRow key={log.id} log={log} skillsMap={skillsMap} onInvalidate={handleInvalidate} />)
                ) : (
                    <p className="text-center text-muted-foreground py-16">This user has no activity logs.</p>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
