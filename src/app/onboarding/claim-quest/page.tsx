
'use client';

import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Check, CircleOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClaimQuestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const archetype = searchParams.get('archetype');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  const handleClaim = () => {
    // For this MVP first quest, we auto-verify instantly.
    setIsVerified(true);
    
    // Redirect to the reward page after a delay to show the animation
    setTimeout(() => {
      router.push(`/onboarding/reward?archetype=${archetype}`);
    }, 2000);
  };
  
  if (!archetype) {
    redirect('/onboarding/archetype');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-headline">Claim: "The Elixir of Life"</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video rounded-md overflow-hidden border">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <AnimatePresence>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="absolute inset-0 bg-green-500/50 flex items-center justify-center"
                >
                  <div className="border-4 border-white rounded-full p-4">
                    <Check className="h-24 w-24 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
             {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
                    <CircleOff className="w-16 h-16 text-destructive mb-4" />
                    <h3 className="text-xl font-bold text-destructive">Camera Access Denied</h3>
                    <p className="text-muted-foreground">Please enable camera permissions in your browser settings to continue.</p>
                </div>
             )}
              {hasCameraPermission === null && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                </div>
              )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleClaim} disabled={!hasCameraPermission || isVerified} className="w-full font-bold">
            <Camera className="mr-2 h-4 w-4" />
            {isVerified ? 'VERIFIED!' : 'Claim Quest'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
