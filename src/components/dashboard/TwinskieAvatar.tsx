
import type { SkillCategory, User } from "@/lib/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import { useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

interface TwinskieAvatarProps {
  isInactive: boolean;
}

const LAYER_MAP: Record<SkillCategory, string> = {
    Physical: 'avatar-layer-physical',
    Mental: 'avatar-layer-mental',
    Social: 'avatar-layer-social',
    Practical: 'avatar-layer-practical',
    Creative: 'avatar-layer-creative',
};


export function TwinskieAvatar({ isInactive }: TwinskieAvatarProps) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const baseAvatar = PlaceHolderImages.find(p => p.id === 'twinskie-default');

  const getVisibleLayers = () => {
    if (!user || !user.avatarLayers) return [];
    
    const layers: ImagePlaceholder[] = [];
    
    // Check for explicit true flags in avatarLayers
    for (const [category, layerId] of Object.entries(LAYER_MAP)) {
      if (user.avatarLayers[category as SkillCategory]) {
        const layerData = PlaceHolderImages.find(p => p.id === layerId);
        if (layerData) {
          layers.push(layerData);
        }
      }
    }
    return layers;
  };

  const visibleLayers = getVisibleLayers();

  return (
    <div className={cn(
      "relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/50 flex items-center justify-center transition-all duration-500",
      isInactive && "grayscale"
    )}>
      {baseAvatar && (
        <Image
          src={baseAvatar.imageUrl}
          alt={baseAvatar.description}
          width={400}
          height={400}
          data-ai-hint={baseAvatar.imageHint}
          className={cn("absolute inset-0 object-cover transition-transform duration-500", isInactive && "scale-95")}
          priority
        />
      )}
      
      {visibleLayers.map(layer => (
        <Image
            key={layer.id}
            src={layer.imageUrl}
            alt={layer.description}
            width={400}
            height={400}
            data-ai-hint={layer.imageHint}
            className="absolute inset-0 object-cover transition-opacity duration-500 animate-pulse-faint"
        />
      ))}

       {isInactive && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <p className="text-white font-bold text-lg font-headline animate-pulse">Inactive</p>
        </div>
      )}
      <style jsx>{`
        @keyframes pulse-faint {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-pulse-faint {
          animation: pulse-faint 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
