
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Sparkles, ImageDown, User, Check, ChevronsUpDown } from 'lucide-react';
import { ReadyPlayerMeAvatar } from '@/components/ready-player-me';
import { removeBackground } from '@/ai/flows/remove-background';
import { useToast } from '@/hooks/use-toast';
import { generateAvatarImage } from '@/ai/flows/generate-avatar-image';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { User as UserType } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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


function UserSelector({ users, onSelectUser, selectedUser }: { users: UserType[], onSelectUser: (user: UserType) => void, selectedUser: UserType | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser
            ? selectedUser.userName
            : "Select a user..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.userName}
                  onSelect={() => {
                    onSelectUser(user);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.userName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function AdminAvatarGalleryPage() {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  const [transparentAvatarUrl, setTransparentAvatarUrl] = useState<string | null>(null);
  const [finalAvatarUrl, setFinalAvatarUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const usersCollection = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<UserType>(usersCollection);

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setOriginalAvatarUrl(user.avatarUrl || null);
    setTransparentAvatarUrl(null);
    setFinalAvatarUrl(null);
  };
  
  const handleRemoveBackground = async () => {
    if (!originalAvatarUrl) return;
    setIsProcessing(true);
    toast({ title: 'Processing Image...', description: 'Preparing avatar for the AI.' });

    try {
      const response = await fetch(originalAvatarUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          // Convert on the client before calling the server action
          const squareRgbaPng = await convertToSquareRgbaPng(base64data);
          
          toast({ title: 'Removing Background...', description: 'The AI is now working its magic.' });
          
          const result = await removeBackground({ imageDataUri: squareRgbaPng });
          setTransparentAvatarUrl(result.transparentImageDataUri);
          toast({ title: 'Background Removed!', variant: 'default' });
        } catch (procError) {
          console.error(procError);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not process the avatar image.' });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not read image file.' });
        setIsProcessing(false);
      }
    } catch (fetchError) {
      console.error(fetchError);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch the avatar image.' });
      setIsProcessing(false);
    }
  };

  const handleApplyCosmetics = async () => {
    if (!transparentAvatarUrl) return;
    setIsProcessing(true);
    toast({ title: 'Applying Hat...', description: 'The AI is adding a stylish hat.' });
    try {
      // The transparentAvatarUrl is already a square RGBA PNG from the previous step.
      const result = await generateAvatarImage({
        baseAvatarDataUri: transparentAvatarUrl,
        cosmeticVisualDescriptions: ['a stylish top hat'],
      });
      setFinalAvatarUrl(result.generatedAvatarDataUri);
      toast({ title: 'Hat Applied!', variant: 'default' });
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
          <CardTitle className="font-headline text-3xl flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Avatar AI Pipeline
          </CardTitle>
          <CardDescription>Select a user to test the AI-powered avatar processing and cosmetic system.</CardDescription>
        </CardHeader>
        <CardContent>
          {areUsersLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <UserSelector users={users || []} onSelectUser={handleSelectUser} selectedUser={selectedUser} />
          )}
        </CardContent>
      </Card>
      
      {selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Original */}
          <Card>
            <CardHeader>
                <CardTitle>1. Original Avatar</CardTitle>
                <CardDescription>The user's current avatar from Firestore.</CardDescription>
            </CardHeader>
            <CardContent>
                {originalAvatarUrl ? (
                    <div className="p-4 bg-muted rounded-lg">
                        <ReadyPlayerMeAvatar avatarUrl={originalAvatarUrl} />
                    </div>
                ) : (
                    <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground h-64 flex items-center justify-center">This user has no avatar URL.</div>
                )}
                <Button onClick={handleRemoveBackground} disabled={!originalAvatarUrl || isProcessing} className="w-full mt-2">
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    Remove Background
                </Button>
            </CardContent>
          </Card>

          {/* Transparent */}
          <Card>
             <CardHeader>
                <CardTitle>2. AI Processed</CardTitle>
                <CardDescription>The avatar after AI background removal.</CardDescription>
            </CardHeader>
            <CardContent>
                {transparentAvatarUrl ? (
                    <div className="p-4 bg-muted rounded-lg" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                        <ReadyPlayerMeAvatar avatarUrl={transparentAvatarUrl} />
                    </div>
                ) : (
                    <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground h-64 flex items-center justify-center">Waiting for processing...</div>
                )}
                <Button onClick={handleApplyCosmetics} disabled={!transparentAvatarUrl || isProcessing} className="w-full mt-2">
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Apply Hat
                </Button>
            </CardContent>
          </Card>
          
          {/* Final */}
          <Card>
             <CardHeader>
                <CardTitle>3. Final Result</CardTitle>
                <CardDescription>The final avatar with an AI-generated hat.</CardDescription>
            </CardHeader>
            <CardContent>
                {finalAvatarUrl ? (
                    <div className="p-4 bg-muted rounded-lg" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                        <ReadyPlayerMeAvatar avatarUrl={finalAvatarUrl} />
                    </div>
                ) : (
                    <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground h-64 flex items-center justify-center">Waiting for cosmetics...</div>
                )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
