
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Bell, Eye, Palette, Clock, Settings2, ShieldQuestion, Trash2, Smartphone, RefreshCw, Save, Download } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

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
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
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
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    setLastSync(new Date().toLocaleTimeString());
  }, []);

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const settingsRef = useMemoFirebase(() => authUser ? doc(firestore, `users/${authUser.uid}/settings/main`) : null, [firestore, authUser]);
  
  const { data: settingsData, isLoading: isSettingsLoading } = useDoc<any>(settingsRef);
  const { data: userData, isLoading: isUserLoading } = useDoc<User>(userRef);

  const { control, handleSubmit } = useForm<z.infer<typeof settingsSchema>>({
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
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  const handleManualReload = () => {
    toast({ title: "Syncing Nebula...", description: "Pulling latest application state from the core." });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handlePasswordReset = async () => {
    if (auth.currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        toast({ title: 'Password Reset Email Sent', description: 'Check your inbox.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send reset email.' });
      }
    }
  };

  const handleResetOnboarding = async () => {
      if (!authUser) return;
      try {
          const userDocRef = doc(firestore, 'users', authUser.uid);
          await deleteDoc(userDocRef);
          toast({ title: "Onboarding Reset", description: "Your journey will begin anew." });
          router.push('/onboarding/archetype');
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not reset your account." });
      }
  }

  if (isSettingsLoading || isUserLoading) {
      return <div className="space-y-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Settings2 className="w-8 h-8 text-primary"/>
            Settings
          </CardTitle>
          <CardDescription>Customize your ATLAS experience and manage your mobile signal.</CardDescription>
        </CardHeader>
      </Card>

      {/* Mobile App Management */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Smartphone className="w-5 h-5" />
            Mobile App & Sync
          </CardTitle>
          <CardDescription>How to update your ATLAS experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-card border">
              <h4 className="font-bold text-sm mb-1">PWA Update Strategy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To update the app on your phone, simply <strong>close and reopen it</strong>. 
                The system automatically checks for new code on every launch.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <h4 className="font-bold text-sm mb-1">Signal Status</h4>
              <p className="text-xs text-muted-foreground mb-2">Last synchronization with Nebula Core:</p>
              <Badge variant="outline" className="font-mono text-[10px]">{lastSync}</Badge>
            </div>
          </div>
          <Button onClick={handleManualReload} variant="outline" className="w-full border-accent/20 hover:bg-accent/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Force Signal Refresh
          </Button>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Bell className="w-5 h-5" /> Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { name: 'notifications.fireteam', label: 'Fireteam Messages' },
                   { name: 'notifications.quests', label: 'Quest Updates' },
                   { name: 'notifications.traits', label: 'Trait Unlocks' },
                   { name: 'notifications.challenges', label: 'Faction Challenges' },
                   { name: 'notifications.momentum', label: 'Momentum Flame Warnings' },
                 ].map((item) => (
                   <div key={item.name} className="flex items-center justify-between">
                      <Label htmlFor={item.name}>{item.label}</Label>
                      <Controller name={item.name as any} control={control} render={({ field }) => <Switch id={item.name} checked={field.value} onCheckedChange={field.onChange} />} />
                  </div>
                 ))}
              </CardContent>
          </Card>

           <div className="grid md:grid-cols-2 gap-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Eye className="w-5 h-5" /> Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Controller name="privacy.profileVisibility" control={control} render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Public" id="p-public" />
                                  <Label htmlFor="p-public">Public</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Team Only" id="p-team" />
                                  <Label htmlFor="p-team">Team Only</Label>
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
                      <CardTitle className="flex items-center gap-2 text-lg"><Palette className="w-5 h-5" /> Appearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <Controller name="appearance.theme" control={control} render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="dark" id="t-dark" />
                                  <Label htmlFor="t-dark">Dark</Label>
                              </div>
                               <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="light" id="t-light" />
                                  <Label htmlFor="t-light">Light</Label>
                              </div>
                          </RadioGroup>
                      )} />
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="acc-contrast">High Contrast</Label>
                            <Controller name="accessibility.highContrast" control={control} render={({ field }) => <Switch id="acc-contrast" checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="acc-font">Dyslexia Font</Label>
                            <Controller name="accessibility.dyslexiaFont" control={control} render={({ field }) => <Switch id="acc-font" checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                      </div>
                  </CardContent>
              </Card>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold shadow-lg shadow-primary/20">Save All Settings</Button>
      </form>

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive"><ShieldQuestion className="w-5 h-5" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {userData && userRef && <UsernameForm user={userData} userRef={userRef} />}
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handlePasswordReset}>Reset Password</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Reset My Journey</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your character, stats, and progress.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetOnboarding} className="bg-destructive hover:bg-destructive/90">Confirm Deletion</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
