'use client';

import { useState } from 'react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { generateAvatarImage } from '@/actions/generateAvatarImage';
import Image from 'next/image';

const convertToSquareRgbaPng = (dataUri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous'; // Important for fetching from another domain
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 1024;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        
        ctx.clearRect(0, 0, size, size);
  
        const hRatio = size / img.width;
        const vRatio = size / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (size - img.width * ratio) / 2;
        const centerShiftY = (size - img.height * ratio) / 2;
        
        ctx.drawImage(
            img, 0, 0, img.width, img.height,
            centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
        );
  
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => reject(new Error(`Image could not be loaded: ${e.toString()}`));
      img.src = dataUri;
    });
  };

export default function TestAvatarPage() {
    const { user: authUser } = useUser();
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
    const { data: user } = useDoc<User>(userRef);

    const [isLoading, setIsLoading] = useState(false);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTest = async () => {
        if (!user || !user.avatarUrl) {
            setError('User or avatar URL not found.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            // 1. Convert GLB to PNG url
            const imageUrl = new URL(user.avatarUrl.replace('.glb', '.png'));
            imageUrl.searchParams.set('scene', 'fullbody-portrait-v1');
            
            // Using a proxy to avoid CORS issues if necessary. For Firebase storage, direct fetch is fine.
            const fetchUrl = imageUrl.toString();
            setOriginalImage(fetchUrl);

            // 2. Fetch and convert to data URI
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result as string;

                // 3. Convert to square RGBA PNG on client
                const formattedImageDataUri = await convertToSquareRgbaPng(base64data);
                
                // 4. Call server action with formatted image
                const result = await generateAvatarImage({
                    baseAvatarDataUri: formattedImageDataUri,
                    cosmeticVisualDescriptions: ['a futuristic top hat with glowing blue stripes'],
                    quality: 'low',
                });

                setGeneratedImage(result.generatedAvatarDataUri);
            };
            reader.onerror = () => {
                throw new Error("Failed to read image blob.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Avatar Generation Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleTest} disabled={isLoading || !user}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Run Test
                    </Button>

                    {error && <p className="text-destructive">Error: {error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-bold mb-2">Original Avatar</h3>
                            {originalImage ? (
                                <Image src={originalImage} alt="Original" width={512} height={512} className="rounded-md border" />
                            ) : (
                                <div className="w-full h-96 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                    Click "Run Test" to load original image
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Generated Avatar</h3>
                            {isLoading && !generatedImage && (
                                <div className="w-full h-96 bg-muted rounded-md flex items-center justify-center">
                                    <Loader2 className="animate-spin h-10 w-10 text-primary" />
                                </div>
                            )}
                            {generatedImage && (
                                <Image src={generatedImage} alt="Generated" width={512} height={512} className="rounded-md border" />
                            )}
                             {!isLoading && !generatedImage && (
                                <div className="w-full h-96 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                   Awaiting generation...
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}