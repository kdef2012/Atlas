
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { COSMETIC_ITEMS, buildAvatarUrl } from '@/lib/avatar-cosmetics';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const urlModItems = COSMETIC_ITEMS.filter(item => item.type === 'url-mod');

export default function TestUrlModsPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: userData } = useDoc<User>(userRef);

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userData?.avatarLayers) {
      setActiveLayers(userData.avatarLayers);
    }
  }, [userData]);

  const modifiedAvatarUrl = useMemo(() => {
    if (!userData?.avatarUrl) return null;
    const activeCosmetics = COSMETIC_ITEMS.filter(item => activeLayers[item.id]);
    return buildAvatarUrl(userData.avatarUrl, activeCosmetics);
  }, [userData?.avatarUrl, activeLayers]);

  const handleToggle = (itemId: string, checked: boolean) => {
    setActiveLayers(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleSave = () => {
    if (userRef) {
      updateDocumentNonBlocking(userRef, { avatarLayers: activeLayers });
      toast({
        title: 'Avatar Mods Saved',
        description: 'Your URL modifications have been saved to your profile.',
      });
    }
  };

  if (isUserLoading || !userData) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (!userData.avatarUrl) {
    return (
        <Card className="m-8">
            <CardHeader>
                <CardTitle>No Ready Player Me Avatar Found</CardTitle>
                <CardDescription>This debug page requires a Ready Player Me avatar to function. Please create one in the onboarding flow or your profile.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  const userWithPreviewLayers = {
    ...userData,
    avatarUrl: modifiedAvatarUrl,
  }

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold font-headline">Live Preview</h2>
        <TwinskieAvatar user={userWithPreviewLayers} size="lg" />
        <Button onClick={handleSave}>Save to Profile</Button>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>URL Modification Workshop</CardTitle>
            <CardDescription>Test the effects of different URL parameters on your avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urlModItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor={item.id} className="font-medium">{item.name}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={activeLayers[item.id] || false}
                  onCheckedChange={(checked) => handleToggle(item.id, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
