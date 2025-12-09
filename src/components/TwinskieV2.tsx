
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { generateAvatarImage } from '@/ai/flows/generate-avatar-image';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface TwinskieV2Props {
  user: User;
  prompt: string;
  onFinishedLoading: () => void;
}

export function TwinskieV2({ user, prompt, onFinishedLoading }: TwinskieV2Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Default to null
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Don't run on initial empty prompt
    if (!prompt) {
      if (isLoading) onFinishedLoading();
      setIsLoading(false);
      return;
    };

    const generateImage = async () => {
      setIsLoading(true);
      try {
        const result = await generateAvatarImage({
          archetype: user.archetype,
          prompt: prompt,
        });
        setImageUrl(result.generatedImageUrl);
      } catch (error) {
        console.error('Failed to generate avatar image:', error);
        toast({
          variant: 'destructive',
          title: 'Image Generation Failed',
          description: 'The AI failed to generate the image. This may be due to rate limits. Please try again later.',
        });
        setImageUrl(null); // Revert to null on failure to show message
      } finally {
        setIsLoading(false);
        onFinishedLoading();
      }
    };

    generateImage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, user.archetype]);


  if (isLoading) {
    return (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 rounded-lg">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-primary-foreground mt-4">Generating new avatar...</p>
        </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted rounded-lg">
        <p className="text-muted-foreground">Enter a prompt to generate an avatar.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={imageUrl}
        alt={`${user.userName}'s generated avatar`}
        fill
        className="object-contain rounded-lg"
      />
    </div>
  );
}
