
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Megaphone, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { GlobalEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const formSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long.'),
    description: z.string().min(10, 'Description must be at least 10 characters long.'),
    dates: z.object({
        from: z.date({ required_error: 'A start date is required.' }),
        to: z.date({ required_error: 'An end date is required.' }),
    }),
    xpMultiplier: z.coerce.number().min(1).max(5).default(1),
    bannerMessage: z.string().optional(),
    isActive: z.boolean().default(true),
});

function EventList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const eventsCollection = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
    const { data: events, isLoading } = useCollection<GlobalEvent>(eventsCollection);

    const handleDelete = (event: GlobalEvent) => {
        if (!firestore) return;
        const eventRef = doc(firestore, 'events', event.id);
        deleteDocumentNonBlocking(eventRef);
        toast({
            title: "Event Deleted",
            description: `The event "${event.title}" has been removed.`,
        });
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No global events have been created yet.</p>
            </div>
        )
    }
    
    const now = Date.now();
    const activeEvents = events.filter(e => e.endAt > now).sort((a,b) => a.startAt - b.startAt);
    const pastEvents = events.filter(e => e.endAt <= now).sort((a,b) => b.endAt - a.endAt);


    return (
        <div className="space-y-6">
            <h3 className="font-headline text-xl">Active & Upcoming Events</h3>
            {activeEvents.length > 0 ? (
                <div className="space-y-4">
                    {activeEvents.map(event => (
                        <Card key={event.id} className={cn(!event.isActive && "bg-muted/50")}>
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {event.title}
                                        {event.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                                    </CardTitle>
                                    <CardDescription>{event.description}</CardDescription>
                                </div>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the event "{event.title}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(event)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {event.bannerMessage && <p className="text-sm bg-blue-500/10 text-blue-300 p-2 rounded-md border border-blue-500/20">Banner: "{event.bannerMessage}"</p>}
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Starts: {new Date(event.startAt).toLocaleDateString()}</span>
                                    <span>Ends: {new Date(event.endAt).toLocaleDateString()}</span>
                                    {event.xpMultiplier && <span className="font-bold text-accent flex items-center gap-1"><Sparkles className="w-4 h-4"/> {event.xpMultiplier}x XP</span>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : <p className="text-sm text-muted-foreground">No active or upcoming events.</p>}

            <h3 className="font-headline text-xl mt-6">Past Events</h3>
             {pastEvents.length > 0 ? (
                <div className="space-y-4 opacity-60">
                    {pastEvents.map(event => (
                       <Card key={event.id}>
                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>{event.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Ended: {new Date(event.endAt).toLocaleDateString()}</span>
                            </CardContent>
                       </Card>
                    ))}
                </div>
            ) : <p className="text-sm text-muted-foreground">No past events.</p>}
        </div>
    )

}

export default function EventsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();
    const eventsCollection = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            xpMultiplier: 1.5,
            bannerMessage: '',
            isActive: true,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!eventsCollection) return;
        setIsLoading(true);

        const newEvent: Omit<GlobalEvent, 'id'> = {
            title: values.title,
            description: values.description,
            startAt: values.dates.from.getTime(),
            endAt: values.dates.to.getTime(),
            xpMultiplier: values.xpMultiplier,
            bannerMessage: values.bannerMessage,
            isActive: values.isActive,
        };

        addDocumentNonBlocking(eventsCollection, newEvent);
        
        setTimeout(() => {
            toast({
                title: 'Event Created!',
                description: `The event "${values.title}" is now live.`,
            });
            form.reset();
            setIsLoading(false);
        }, 1000);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2">
                        <Megaphone className="w-8 h-8 text-primary" />
                        Global Event Broadcaster
                    </CardTitle>
                    <CardDescription>
                        Create and manage limited-time events and announcements for the entire ATLAS community.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Event or Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl><Input placeholder="e.g., Double XP Weekend" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="A short, engaging description for the event." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="dates"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Event/Announcement Dates</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value?.from && "text-muted-foreground"
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                <>
                                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                                    {format(field.value.to, "LLL dd, y")}
                                                </>
                                                ) : (
                                                format(field.value.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={field.value?.from}
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            numberOfMonths={2}
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bannerMessage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Announcement Banner (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., Server maintenance tonight at 2am!" {...field} /></FormControl>
                                        <FormDescription>This message will be displayed in a banner to all users during the event dates.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="xpMultiplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>XP Multiplier</FormLabel>
                                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                                        <FormDescription>e.g., 1.5 for a 50% XP boost. Leave at 1 for no boost (e.g. for an announcement-only event).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Activate Event</FormLabel>
                                            <FormDescription>Make this event immediately visible to all users.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
                                Create Event
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Event Management</CardTitle>
                </CardHeader>
                <CardContent>
                   <EventList />
                </CardContent>
            </Card>
        </div>
    )
}

    