
'use client';

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_COLORS, CATEGORY_ICONS, type SkillCategory } from "@/lib/types";
import type { Quest } from "@/lib/quest";
import { Sparkles, CheckCircle2, Loader2, Camera, X, Power, Image as ImageIcon, Paperclip, ShieldAlert } from "lucide-react";
import { haptics } from "@/lib/haptics";
import { useFirestore, updateDocumentNonBlocking, uploadProofOfWork, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reliable stream assignment to prevent "grey box"
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraActive, cameraStream]);

  const Icon = (quest.category !== 'Intro' && CATEGORY_ICONS[quest.category as SkillCategory]) 
    ? CATEGORY_ICONS[quest.category as SkillCategory] 
    : Sparkles;
    
  const color = (quest.category !== 'Intro' && CATEGORY_COLORS[quest.category as SkillCategory]) 
    ? CATEGORY_COLORS[quest.category as SkillCategory] 
    : 'hsl(var(--primary))';

  const startCamera = async () => {
    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Camera Sensors Offline',
        description: 'Ensure permissions are granted to provide visual proof.'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return;
    
    if (videoRef.current.videoWidth === 0) {
      toast({ description: "Initializing sensors..." });
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvas.toDataURL('image/png'));
      setSelectedFile(null);
      stopCamera();
      haptics.light();
    }
  };

  const handleSubmitProof = async () => {
    if (!user || (!capturedImage && !selectedFile)) return;

    setIsSubmitting(true);
    haptics.light();

    try {
      let proofUrl = '';
      if (capturedImage) {
        const blob = await (await fetch(capturedImage)).blob();
        const photoFile = new File([blob], "quest_proof.png", { type: "image/png" });
        proofUrl = await uploadProofOfWork(user.uid, photoFile);
      } else if (selectedFile) {
        proofUrl = await uploadProofOfWork(user.uid, selectedFile);
      }

      const questRef = doc(firestore, 'users', quest.userId, 'quests', quest.id);
      updateDocumentNonBlocking(questRef, { 
        isCompleted: true, 
        isVerified: false,
        verificationPhotoUrl: proofUrl 
      });

      haptics.success();
      toast({
        title: "Proof Transmitted",
        description: "Objective archived. Awaiting community verification."
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Transmission Failed',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/50 hover:bg-card transition-colors relative overflow-hidden">
      <CardContent className="p-4 flex items-start space-x-4">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color.replace(')', ' / 0.1)')}`, color: color }}
        >
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold">{quest.name}</h3>
            {quest.isCompleted && quest.isVerified ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Archived
              </Badge>
            ) : quest.isCompleted ? (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                <ShieldAlert className="w-3 h-3 mr-1" /> Pending
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{quest.description}</p>
          
          {!quest.isCompleted && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                stopCamera();
                setCapturedImage(null);
                setSelectedFile(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3 h-8 text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/10"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Complete Objective
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl">Discovery Proof</DialogTitle>
                  <DialogDescription>
                    Pioneering this objective requires a visual signal. Provide a photo or video of your achievement.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-black/40 aspect-video flex items-center justify-center">
                    {capturedImage ? (
                      <img src={capturedImage} alt="Proof" className="w-full h-full object-cover" />
                    ) : isCameraActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center p-6">
                        <Camera className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-2" />
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Camera Sensor Offline</p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={isCameraActive ? "secondary" : "outline"} 
                      className="font-bold" 
                      onClick={isCameraActive ? capturePhoto : startCamera}
                      disabled={isInitializing || isSubmitting}
                    >
                      {isInitializing ? <Loader2 className="animate-spin h-4 w-4" /> : isCameraActive ? <Camera className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                      {isCameraActive ? "Capture" : "Initialize"}
                    </Button>
                    <div className="relative">
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0]);
                            setCapturedImage(null);
                            stopCamera();
                          }
                        }}
                      />
                      <Button variant="outline" className="w-full font-bold">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {selectedFile ? "Changed" : "Attach"}
                      </Button>
                    </div>
                  </div>

                  {(capturedImage || selectedFile) && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20 text-[10px] font-black uppercase">
                      <CheckCircle2 className="h-3 w-3" />
                      Signal Locked: {selectedFile?.name || "webcam_capture.png"}
                    </div>
                  )}

                  <Button 
                    className="w-full h-12 text-lg font-bold" 
                    onClick={handleSubmitProof} 
                    disabled={(!capturedImage && !selectedFile) || isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    {isSubmitting ? "Transmitting..." : "Submit Discovery Proof"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
