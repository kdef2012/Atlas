'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, ArrowRight, Sparkles, ImageDown } from 'lucide-react';
import { ReadyPlayerMeCreator, ReadyPlayerMeAvatar } from '@/components/ready-player-me';
import { removeBackground } from '@/ai/flows/remove-background';
import { useToast } from '@/hooks/use-toast';
import { generateAvatarImage } from '@/ai/flows/generate-avatar-image';

export default function AvatarGalleryPage() {
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [transparentAvatarUrl, setTransparentAvatarUrl] = useState<string | null>(null);
  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAvatarCreated = (url: string) => {
    setOriginalAvatarUrl(url);
    setTransparentAvatarUrl(null);
    setFinalAvatarUrl(null);
    toast({ title: 'Avatar Created', description: 'Ready to process.' });
  };

  const handleRemoveBackground = async () => {
    if (!originalAvatarUrl) return;
    setIsProcessing(true);
    toast({ title: 'Removing Background...', description: 'The AI is working its magic.' });
    try {
      // Fetch the GLB and convert to a data URI for the AI flow
      const response = await fetch(originalAvatarUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await removeBackground({ imageDataUri: base64data });
        setTransparentAvatarUrl(result.transparentImageDataUri);
        toast({ title: 'Background Removed!', variant: 'default' });
        setIsProcessing(false);
      };
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not remove background.' });
      setIsProcessing(false);
    }
  };

  const handleApplyCosmetics = async () => {
    if (!transparentAvatarUrl) return;
    setIsProcessing(true);
    toast({ title: 'Applying Cosmetics...', description: 'The AI is adding some flair.' });
    try {
      const result = await generateAvatarImage({
        baseAvatarDataUri: transparentAvatarUrl,
        cosmeticVisualDescriptions: ['a glowing blue aura', 'a golden crown on the head'],
      });
      setFinalAvatarUrl(result.generatedAvatarDataUri);
      toast({ title: 'Cosmetics Applied!', variant: 'default' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not apply cosmetics.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Avatar Cosmetic Gallery</CardTitle>
          <CardDescription>A showcase of the AI-powered avatar processing pipeline.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step 1: Create Avatar */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create Your Avatar</CardTitle>
            <CardDescription>Use the creator to generate a base avatar.</CardDescription>
          </CardHeader>
          <CardContent className="h-96">
            <ReadyPlayerMeCreator onAvatarCreated={handleAvatarCreated} />
          </CardContent>
        </Card>

        {/* Step 2: View and Process */}
        <div className="space-y-4 text-center">
            <h2 className="font-headline text-2xl">Step 2: Process with AI</h2>
            <ArrowRight className="w-12 h-12 mx-auto text-primary hidden lg:block" />
             <ImageDown className="w-12 h-12 mx-auto text-primary lg:hidden" />
        </div>

        {/* Step 3: Results */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: See the Results</CardTitle>
            <CardDescription>View the original, transparent, and stylized versions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold mb-2">Original Avatar</h3>
              {originalAvatarUrl ? (
                <div className="p-4 bg-muted rounded-lg">
                  <ReadyPlayerMeAvatar avatarUrl={originalAvatarUrl} />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">Create an avatar to begin</div>
              )}
              <Button onClick={handleRemoveBackground} disabled={!originalAvatarUrl || isProcessing} className="w-full mt-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                Remove Background
              </Button>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Transparent Avatar</h3>
              {transparentAvatarUrl ? (
                <div className="p-4 bg-muted rounded-lg" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                    <ReadyPlayerMeAvatar avatarUrl={transparentAvatarUrl} />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">Waiting for processing...</div>
              )}
               <Button onClick={handleApplyCosmetics} disabled={!transparentAvatarUrl || isProcessing} className="w-full mt-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Apply Cosmetics
              </Button>
            </div>

             <div>
              <h3 className="font-bold mb-2">Final Avatar with Cosmetics</h3>
              {finalAvatarUrl ? (
                <div className="p-4 bg-muted rounded-lg">
                    <ReadyPlayerMeAvatar avatarUrl={finalAvatarUrl} />
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">Waiting for cosmetics...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
