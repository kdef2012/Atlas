
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowRight, Sparkles, Link as LinkIcon } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { ReadyPlayerMeCreator } from '@/components/ready-player-me';
import { Input } from '@/components/ui/input';

export default function CustomizeAvatarPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const handleAvatarCreated = (url: string) => {
    console.log('Avatar URL received:', url);
    setAvatarUrl(url);
    toast({
      title: '✨ Avatar URL Set!',
      description: 'Your Twinskie is ready! Click Continue to proceed.',
    });
  };
  
  const handleManualUrlSubmit = () => {
    if (manualUrl && (manualUrl.startsWith('http') || manualUrl.startsWith('https://'))) {
      handleAvatarCreated(manualUrl);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid URL.',
      });
    }
  };


  const handleProceed = async (skipped: boolean = false) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'User not found. Please go back and try again.',
      });
      return;
    }
    if (!avatarUrl && !skipped) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please create your avatar, provide a URL, or skip this step.',
      });
      return;
    }

    setIsLoading(true);

    const userRef = doc(firestore, 'users', user.uid);
    const updates: { avatarUrl?: string, avatarStyle: string } = {
        avatarStyle: skipped ? 'openpeeps' : 'readyplayerme',
    };

    if (avatarUrl && !skipped) {
        updates.avatarUrl = avatarUrl;
    }
    
    updateDocumentNonBlocking(userRef, updates);

    setTimeout(() => {
      toast({
        title: '🎮 Twinskie Forged!',
        description: 'Your Twinskie has been born. Welcome to ATLAS.',
      });
      router.push(`/onboarding/welcome?archetype=${archetype}`);
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Design Your Twinskie
        </h1>
        <p className="text-muted-foreground mt-2">Create your realistic digital avatar, or skip for a default one.</p>
      </div>
      
      <div className="w-full max-w-4xl space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Avatar Creator
            </CardTitle>
            <CardDescription>
              Use the creator below or paste a .glb URL to generate your avatar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full" style={{ height: '500px' }}>
              <ReadyPlayerMeCreator
                onAvatarCreated={handleAvatarCreated}
                className="h-full"
              />
            </div>
             <div className="p-4 border-t">
                <p className="text-sm font-medium text-center mb-2">Or paste an avatar URL</p>
                <div className="flex gap-2">
                    <Input 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="Paste a .glb or .png avatar URL here"
                    />
                    <Button onClick={handleManualUrlSubmit} variant="secondary">
                        <LinkIcon className="mr-2 h-4 w-4"/>
                        Submit URL
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={() => handleProceed(true)}
              disabled={isLoading}
              size="lg"
              variant="outline"
            >
              Skip for Now
            </Button>
            <Button
              onClick={() => handleProceed(false)}
              disabled={isLoading || !avatarUrl}
              size="lg"
              className="font-bold group text-lg px-8"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Continue to ATLAS
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Tip: You can take a selfie for a personalized avatar or browse preset options</p>
        </div>
      </div>
    </main>
  );
}
