'use client';

import { useState } from 'react';
import { useUser, useDoc, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { COSMETIC_ITEMS } from '@/lib/avatar-cosmetics';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DebugCosmeticsPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: userData } = useDoc<User>(userRef);

  const [localLayers, setLocalLayers] = useState<Record<string, boolean>>({});

  if (isUserLoading || !userData) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  const handleToggle = (itemId: string, checked: boolean) => {
    const newLayers = { ...localLayers, [itemId]: checked };
    setLocalLayers(newLayers);
  };
  
  const handleSave = () => {
    if (userRef) {
      updateDocumentNonBlocking(userRef, { avatarLayers: localLayers });
    }
  };

  const displayedUser = {
    ...userData,
    avatarLayers: localLayers,
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold font-headline">Live Preview</h2>
        <TwinskieAvatar user={displayedUser} size="lg" />
        <Button onClick={handleSave}>Save to Profile</Button>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Cosmetics Workshop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {COSMETIC_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor={item.id} className="font-medium">{item.name}</Label>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={localLayers[item.id] || false}
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