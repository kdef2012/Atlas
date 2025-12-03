
import type { SkillCategory, User } from "@/lib/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";
import { useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { Skeleton } from "../ui/skeleton";

interface TwinskieAvatarProps {
  isInactive: boolean;
}

const LAYER_MAP: Record<string, string> = {
    newbie_sweatband: 'avatar-layer-newbie-sweatband',
    cosmetic_shadow_cloak: 'avatar-layer-shadow-cloak',
    cosmetic_arcane_goggles: 'avatar-layer-arcane-goggles',
    cosmetic_titans_pauldrons: 'avatar-layer-titans-pauldrons',
};

export function TwinskieAvatar({ isInactive }: TwinskieAvatarProps) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const baseAvatarUrl = user?.avatarUrl;

  const getVisibleLayers = () => {
    if (!user || !user.avatarLayers) return [];
    
    return Object.keys(user.avatarLayers)
        .filter(layerKey => user.avatarLayers?.[layerKey as keyof typeof user.avatarLayers] === true)
        .map(layerKey => {
            const layerId = LAYER_MAP[layerKey];
            return PlaceHolderImages.find(p => p.id === layerId);
        })
        .filter((l): l is ImagePlaceholder => !!l);
  };

  const visibleLayers = getVisibleLayers();

  if (!user || !baseAvatarUrl) {
      return (
        <div className={cn(
            "relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/50 flex items-center justify-center transition-all duration-500",
            isInactive && "grayscale"
        )}>
            <Skeleton className="w-full h-full" />
        </div>
      )
  }

  return (
    <div className={cn(
      "relative w-48 h-48 rounded-lg overflow-hidden border-4 border-primary/50 flex items-center justify-center transition-all duration-500",
      isInactive && "grayscale"
    )}>
      
        <Image
          src={baseAvatarUrl}
          alt={user.userName || 'User Avatar'}
          width={200}
          height={200}
          className={cn("absolute inset-0 w-full h-full object-cover transition-transform duration-500", isInactive && "scale-95")}
          priority
        />
      
      {visibleLayers.map(layer => (
        <Image
            key={layer.id}
            src={layer.imageUrl}
            alt={layer.description}
            width={200}
            height={200}
            data-ai-hint={layer.imageHint}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 animate-pulse-faint"
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
