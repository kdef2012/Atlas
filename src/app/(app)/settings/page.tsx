
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth, useDoc, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bell, Eye, Palette, Clock, Settings2, ShieldQuestion, Trash2, LogOut, Download, Save } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the shape of the settings object
interface UserSettings {
    notifications: {
        fireteam: boolean;
        quests: boolean;
        traits: boolean;
        challenges: boolean;
        momentum: boolean;
    };
    privacy: {
        profileVisibility: 'Public' | 'Team Only' | 'Private';
    };
    appearance: {
        theme: 'dark' | 'light';
    };
    accessibility: {
        highContrast: boolean;
        dyslexiaFont: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
}


const settingsSchema = z.object({
  notifications: z.object({
    fireteam: z.boolean(),
    quests: z.boolean(),
    traits: z.boolean(),
    challenges: z.boolean(),
    momentum: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['Public', 'Team Only', 'Private']),
  }),
  appearance: z.object({
    theme: z.enum(['dark', 'light']),
  }),
  accessibility: z.object({
    highContrast: z.boolean(),
    dyslexiaFont: z.boolean(),
  }),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
  }),
});

// New schema for the username form
const usernameSchema = z.object({
  userName: z.string().min(3, 'Username must be at least 3 characters.').max(30, 'Username is too long.'),
});

function UsernameForm({ user, userRef }: { user: User, userRef: any }) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const form = useForm<z.infer<typeof usernameSchema>>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            userName: user.userName,
        },
    });

    function onSubmit(data: z.infer<typeof usernameSchema>) {
        if (!userRef) return;
        setIsSaving(true);
        updateDocumentNonBlocking(userRef, { userName: data.userName });
        
        setTimeout(() => {
             toast({
                title: "Username Updated",
                description: `Your display name has been changed to ${data.userName}.`,
            });
            setIsSaving(false);
        }, 1000);
    }

    return (
        <Form {...form}>
            <div className="space-y-4 pt-4 border-t">
                 <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Change Username</FormLabel>
                        <div className="flex gap-2">
                             <FormControl>
                                <Input placeholder="New username" {...field} />
                            </FormControl>
                            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                                <span className="ml-2 hidden sm:inline">Save</span>
                            </Button>
                        </div>
                       
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Form>
    )
}


export default function SettingsPage() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const settingsRef = useMemoFirebase(() => authUser ? doc(firestore, `users/${authUser.uid}/settings/main`) : null, [firestore, authUser]);
  
  const { data: settingsData, isLoading: isSettingsLoading } = useDoc<UserSettings>(settingsRef);
  const { data: userData, isLoading: isUserLoading } = useDoc<User>(userRef);

  const { control, handleSubmit, reset } = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    values: {
      notifications: settingsData?.notifications ?? { fireteam: true, quests: true, traits: true, challenges: true, momentum: true },
      privacy: settingsData?.privacy ?? { profileVisibility: 'Public' },
      appearance: settingsData?.appearance ?? { theme: 'dark' },
      accessibility: settingsData?.accessibility ?? { highContrast: false, dyslexiaFont: false },
      quietHours: settingsData?.quietHours ?? { enabled: false, start: '22:00', end: '08:00' },
    },
  });

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    if (!settingsRef) return;
    
    setDocumentNonBlocking(settingsRef, data, { merge: true });

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const handlePasswordReset = async () => {
    if (auth.currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your inbox for instructions to reset your password.',
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not send password reset email.',
        });
      }
    }
  };

  const handleResetOnboarding = async () => {
      if (!authUser) return;
      
      try {
          const userDocRef = doc(firestore, 'users', authUser.uid);
          await deleteDoc(userDocRef); // This will delete the user's data
          
          toast({
              title: "Onboarding Reset",
              description: "Your journey will begin anew.",
          });

          // After deletion, the AppLayout logic will redirect to onboarding
          router.push('/onboarding/archetype');

      } catch (error) {
          console.error("Failed to reset onboarding:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not reset your account." });
      }
  }

  if (isSettingsLoading || isUserLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Settings2 className="w-8 h-8 text-primary"/>
            Settings
          </CardTitle>
          <CardDescription>Customize your ATLAS experience.</CardDescription>
        </CardHeader>
      </Card>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Notifications Card */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                      <Label htmlFor="notif-fireteam">Fireteam Messages</Label>
                      <Controller name="notifications.fireteam" control={control} render={({ field }) => <Switch id="notif-fireteam" checked={field.value} onCheckedChange={field.onChange} />} />
                  </div>
                   <div className="flex items-center justify-between">
                      <Label htmlFor="notif-quests">Quest Updates</Label>
                      <Controller name="notifications.quests" control={control} render={({ field }) => <Switch id="notif-quests" checked={field.value} onCheckedChange={field.onChange} />} />
                  </div>
                   <div className="flex items-center justify-between">
                      <Label htmlFor="notif-traits">Trait Unlocks</Label>
                      <Controller name="notifications.traits" control={control} render={({ field }) => <Switch id="notif-traits" checked={field.value} onCheckedChange={field.onChange} />} />
                  </div>
                   <div className="flex items-center justify-between">
                      <Label htmlFor="notif-challenges">Faction Challenges</Label>
                      <Controller name="notifications.challenges" control={control} render={({ field }) => <Switch id="notif-challenges" checked={field.value} onCheckedChange={field.onChange} />} />
                  </div>
                   <div className="flex items-center justify-between">
                      <Label htmlFor="notif-momentum">Momentum Flame Warnings</Label>
                      <Controller name="notifications.momentum" control={control} render={({ field }) => <Switch id="notif-momentum" checked={field.value} onCheckedChange={field.onChange} />} />
                  </div>
              </CardContent>
          </Card>

          {/* Privacy & Appearance */}
           <div className="grid md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Eye /> Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Controller name="privacy.profileVisibility" control={control} render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                              <Label>Profile Visibility</Label>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Public" id="p-public" />
                                  <Label htmlFor="p-public">Public</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Team Only" id="p-team" />
                                  <Label htmlFor="p-team">Fireteam & Guild Members Only</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Private" id="p-private" />
                                  <Label htmlFor="p-private">Private</Label>
                              </div>
                          </RadioGroup>
                      )} />
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Palette/> Appearance & Accessibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <Controller name="appearance.theme" control={control} render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                              <Label>Theme</Label>
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="dark" id="t-dark" />
                                  <Label htmlFor="t-dark">Dark Mode</Label>
                              </div>
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="light" id="t-light" />
                                  <Label htmlFor="t-light">Light Mode</Label>
                              </div>
                          </RadioGroup>
                      )} />
                      <div className="flex items-center justify-between">
                          <Label htmlFor="acc-contrast">High Contrast Mode</Label>
                          <Controller name="accessibility.highContrast" control={control} render={({ field }) => <Switch id="acc-contrast" checked={field.value} onCheckedChange={field.onChange} />} />
                      </div>
                       <div className="flex items-center justify-between">
                          <Label htmlFor="acc-font">Dyslexia-Friendly Font</Label>
                          <Controller name="accessibility.dyslexiaFont" control={control} render={({ field }) => <Switch id="acc-font" checked={field.value} onCheckedChange={field.onChange} />} />
                      </div>
                  </CardContent>
              </Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock /> Quiet Hours</CardTitle>
                <CardDescription>Set a "do not disturb" window to silence all push notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="quiet-enabled">Enable Quiet Hours</Label>
                    <Controller name="quietHours.enabled" control={control} render={({ field }) => <Switch id="quiet-enabled" checked={field.value} onCheckedChange={field.onChange} />} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="quiet-start">Start Time</Label>
                        <Controller name="quietHours.start" control={control} render={({ field }) => <Input id="quiet-start" type="time" {...field} />} />
                    </div>
                    <div>
                        <Label htmlFor="quiet-end">End Time</Label>
                        <Controller name="quietHours.end" control={control} render={({ field }) => <Input id="quiet-end" type="time" {...field} />} />
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <Button type="submit" size="lg" className="w-full">Save Settings</Button>
      </form>

      {/* Account Management is outside the main form */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldQuestion /> Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {userData && userRef && <UsernameForm user={userData} userRef={userRef} />}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handlePasswordReset}>Change Password</Button>
                <Button type="button" variant="outline"><Download className="mr-2"/>Export My Data</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive"><Trash2 className="mr-2"/>Reset Onboarding</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your character, stats, and progress, allowing you to start the onboarding process over.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetOnboarding} className="bg-destructive hover:bg-destructive/90">Yes, Reset My Journey</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
