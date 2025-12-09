
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Wand2 } from 'lucide-react';
import { TwinskieV2 } from '@/components/TwinskieV2';
import { Badge } from '@/components/ui/badge';

export default function AvatarV2ShowcasePage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: userData, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const [prompt, setPrompt] = useState('A powerful Titan with a fiery aura');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setSubmittedPrompt(prompt);
  };
  
  const handleFinishedLoading = () => {
    setIsLoading(false);
  }

  const isLoadingAnything = isUserLoading || isUserDocLoading;

  if (isLoadingAnything || !userData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Avatar V2 Showcase</CardTitle>
          <CardDescription>
            Test the new AI-powered avatar generation system. Describe a character and cosmetic effect to generate a new avatar portrait.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-sm font-medium">Your Archetype: <Badge variant="outline">{userData.archetype}</Badge></div>
            <div className="flex gap-2">
                 <Input 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A wise Sage surrounded by a blue, electric glow"
                />
                 <Button onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    <span className="ml-2 hidden sm:inline">Generate</span>
                </Button>
            </div>
            
            <div className="relative aspect-square w-full bg-secondary rounded-lg flex items-center justify-center p-4">
                <TwinskieV2 
                    user={userData}
                    prompt={submittedPrompt}
                    onFinishedLoading={handleFinishedLoading}
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
