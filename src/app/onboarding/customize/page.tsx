'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowRight, Sparkles, Link as LinkIcon, Check } from 'lucide-react';
import type { Archetype } from '@/lib/types';
import { ReadyPlayerMeCreator } from '@/components/ready-player-me';
import { Input } from '@/components/ui/input';
import { removeBackground } from '@/actions/removeBackground';

/**
 * Converts an image data URI to a square, RGBA PNG format required by DALL-E.
 * This runs on the client-side.
 */
const convertToSquareRgbaPng = (dataUri: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // DALL-E requires square images (256, 512, or 1024). We'll use 1024.
      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      
      // Make background transparent to ensure RGBA format.
      ctx.clearRect(0, 0, size, size);

      // Calculate aspect ratio to draw the image centered without stretching.
      const hRatio = size / img.width;
      const vRatio = size / img.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (size - img.width * ratio) / 2;
      const centerShiftY = (size - img.height * ratio) / 2;
      
      ctx.drawImage(
          img, 0, 0, img.width, img.height,
          centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
      );

      // This will now be a square RGBA data URL.
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(new Error(`Image could not be loaded: ${e.toString()}`));
    img.src = dataUri;
  });
};


export default function CustomizeAvatarPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype') as Archetype | null;

  const handleAvatarCreated = async (url: string) => {
    setIsProcessing(true);
    toast({
      title: '✨ Avatar Forged!',
      description: 'Now removing the background... This may take a moment.',
    });
    
    try {
        // Construct the PNG URL from the GLB URL
        const imageUrl = new URL(url.replace('.glb', '.png'));
        imageUrl.searchParams.set('scene', 'fullbody-portrait-v1');
        
        // Fetch the image to get a data URI for the AI
        const response = await fetch(imageUrl.toString());
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            
            // Client-side conversion to the correct format BEFORE calling the server action
            const squareRgbaPng = await convertToSquareRgbaPng(base64data);

            // Call the background removal flow
            const result = await removeBackground({ imageDataUri: squareRgbaPng });
            
            setAvatarUrl(result.transparentImageDataUri);
            toast({
                title: '✅ Background Removed!',
                description: 'Your transparent Twinskie is ready! Click Continue.',
            });
            setIsProcessing(false);
        };
    } catch (error) {
        console.error("Failed to process avatar:", error);
        toast({
            variant: 'destructive',
            title: 'Processing Failed',
            description: 'Could not remove the background. Using original avatar.',
        });
        // Fallback to the original URL, but as a renderable PNG
        const fallbackUrl = new URL(url.replace('.glb', '.png'));
        fallbackUrl.searchParams.set('scene', 'fullbody-portrait-v1');
        setAvatarUrl(fallbackUrl.toString());
        setIsProcessing(false);
    }
  };
  
  const handleManualUrlSubmit = () => {
    if (manualUrl && (manualUrl.startsWith('http://') || manualUrl.startsWith('https://'))) {
        if (manualUrl.endsWith('.glb')) {
            handleAvatarCreated(manualUrl);
        } else {
             toast({
                variant: 'destructive',
                title: 'Invalid URL',
                description: 'The URL must end with .glb to be a valid avatar model.',
            });
        }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid URL starting with http:// or https://',
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
        title: 'Avatar Not Set',
        description: 'Please create your avatar, provide a URL, or skip this step.',
      });
      return;
    }

    setIsLoading(true);

    const userRef = doc(firestore, 'users', user.uid);
    
    const updates: { avatarUrl?: string; avatarStyle: string } = {
      avatarStyle: avatarUrl ? 'readyplayerme' : 'default',
    };

    if (avatarUrl) {
      updates.avatarUrl = avatarUrl;
    }
    
    updateDocumentNonBlocking(userRef, updates);

    // Using a timeout to ensure the user sees the confirmation before navigation
    setTimeout(() => {
      toast({
        title: '🎮 Welcome to ATLAS!',
        description: 'Your Twinskie has been born.',
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
            <div className="w-full h-[500px]">
              <ReadyPlayerMeCreator
                onAvatarCreated={handleAvatarCreated}
                className="h-full"
              />
            </div>
             <div className="p-4 border-t">
                <p className="text-sm font-medium text-center mb-2">Or paste a .glb avatar URL</p>
                <div className="flex gap-2">
                    <Input 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://models.readyplayer.me/your-avatar.glb"
                    />
                    <Button onClick={handleManualUrlSubmit} variant="secondary">
                        <LinkIcon className="mr-2 h-4 w-4"/>
                        Use URL
                    </Button>
                </div>
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
              {isProcessing ? 'Processing...' : 'Continue to ATLAS'}
              {!isProcessing && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
            </Button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Tip: Use the "take a photo" option in the creator for a personalized avatar, or browse presets.</p>
        </div>
      </div>
    </main>
  );
}