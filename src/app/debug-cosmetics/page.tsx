
'use client';

import { useState, useEffect } from 'react';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { COSMETIC_ITEMS } from '@/lib/avatar-cosmetics';
import { Loader2, Bug, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function DebugCosmeticsPage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: userData, isLoading: isDocLoading } = useDoc<User>(userDocRef);

  const [debugLayers, setDebugLayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userData?.avatarLayers) {
      setDebugLayers(userData.avatarLayers as Record<string, boolean>);
    }
  }, [userData]);

  const handleToggleLayer = (itemId: string) => {
    setDebugLayers(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const isLoading = isAuthLoading || isDocLoading;

  if (isLoading || !userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Create a temporary user object with the debug layers for the avatar component
  const debugUser: User = {
    ...userData,
    avatarLayers: debugLayers,
  };

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="font-headline text-3xl flex items-center gap-2">
                    <Bug className="w-8 h-8 text-primary" />
                    Cosmetics Debug Panel
                </CardTitle>
                <CardDescription>
                    Test and preview cosmetic items on your Twinskie in real-time.
                </CardDescription>
            </CardHeader>
        </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <TwinskieAvatar user={debugUser} size="md" />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Available Cosmetics
              </CardTitle>
              <CardDescription>Toggle items to see them on the preview avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {COSMETIC_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor={item.id} className="text-base font-medium">{item.name}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                     <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={debugLayers[item.id] || false}
                    onCheckedChange={() => handleToggleLayer(item.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
