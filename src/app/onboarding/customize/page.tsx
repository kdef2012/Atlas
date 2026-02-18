'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowRight, Sparkles, Check } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { UnionAvatarsCreator } from '@/components/union-avatars';
import { removeBackground } from '@/actions/removeBackground';

export default function CustomizeAvatarPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const handleAvatarCreated = async (glbUrl: string, previewUrl?: string) => {
    setIsProcessing(true);
    toast({
      title: '✨ Avatar Forged!',
      description: 'The Union is established. Optimizing for ATLAS...',
    });
    
    try {
        // If Union Avatars provided a preview image, use that.
        // Otherwise, we might need a fallback, but we'll assume a preview is available.
        const sourceImage = previewUrl || glbUrl.replace('.glb', '.png'); 
        
        // Fetch the image to get a data URI for the AI
        const response = await fetch(sourceImage);
        if (!response.ok) throw new Error("Failed to fetch preview image");
        
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            
            // Call our AI Stylist's background removal flow
            const result = await removeBackground({ imageDataUri: base64data });
            
            setAvatarUrl(result.transparentImageDataUri);
            toast({
                title: '✅ Optimization Complete!',
                description: 'Your transparent base Twinskie is ready.',
            });
            setIsProcessing(false);
        };
    } catch (error) {
        console.error("Failed to process avatar:", error);
        toast({
            variant: 'destructive',
            title: 'Processing Failed',
            description: 'Could not optimize the background. Using original preview.',
        });
        setAvatarUrl(previewUrl || glbUrl.replace('.glb', '.png'));
        setIsProcessing(false);
    }
  };

  const handleProceed = async (skipped: boolean = false) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'User not found.',
      });
      return;
    }
    if (!avatarUrl && !skipped) {
      toast({
        variant: 'destructive',
        title: 'Avatar Not Set',
        description: 'Please forge your Twinskie first.',
      });
      return;
    }

    setIsLoading(true);

    const userRef = doc(firestore, 'users', user.uid);
    
    const updates: { avatarUrl?: string; baseAvatarUrl?: string; avatarStyle: string } = {
      avatarStyle: 'union-avatars',
    };

    if (avatarUrl) {
      updates.avatarUrl = avatarUrl;
      updates.baseAvatarUrl = avatarUrl;
    }
    
    updateDocumentNonBlocking(userRef, updates);

    setTimeout(() => {
      toast({
        title: '🎮 Welcome to ATLAS!',
        description: 'Your Twinskie has been synchronized.',
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
          Forge Your Twinskie
        </h1>
        <p className="text-muted-foreground mt-2">Create your realistic digital twin using Union Avatars.</p>
      </div>
      
      <div className="w-full max-w-4xl space-y-4">
        <Card className="border-primary/20 shadow-xl shadow-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Union Avatars Creator
            </CardTitle>
            <CardDescription>
              Design your character below. When finished, save to synchronize with ATLAS.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[600px]">
              <UnionAvatarsCreator
                onAvatarCreated={handleAvatarCreated}
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={() => handleProceed(true)}
              disabled={isLoading || isProcessing}
              size="lg"
              variant="outline"
            >
              Skip for Now
            </Button>
            <Button
              onClick={() => handleProceed(false)}
              disabled={isLoading || isProcessing || !avatarUrl}
              size="lg"
              className="font-bold group text-lg px-8"
            >
              {(isLoading || isProcessing) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isProcessing ? 'Optimizing...' : 'Enter the ATLAS'}
              {!isProcessing && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
            </Button>
        </div>
      </div>
    </main>
  );
}
