
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

const BASE_AVATAR_MAP: Record<SkillCategory, string> = {
    Physical: 'twinskie-physical',
    Mental: 'twinskie-mental',
    Social: 'twinskie-social',
    Practical: 'twinskie-practical',
    Creative: 'twinskie-creative',
};

const MIN_STAT_THRESHOLD = 50; // Min stat value to trigger a dominant avatar

function getDominantStat(user: User): SkillCategory | null {
    const stats: [SkillCategory, number][] = [
        ['Physical', user.physicalStat],
        ['Mental', user.mentalStat],
        ['Social', user.socialStat],
        ['Practical', user.practicalStat],
        ['Creative', user.creativeStat],
    ];

    // Find the max stat value
    const maxStatValue = Math.max(...stats.map(s => s[1]));

    // If max stat is below threshold, no dominant stat
    if (maxStatValue < MIN_STAT_THRESHOLD) {
        return null;
    }

    // Filter for stats that are equal to the max value
    const topStats = stats.filter(s => s[1] === maxStatValue);

    // If there's a single clear winner, return it
    if (topStats.length === 1) {
        return topStats[0][0];
    }
    
    // If there's a tie, no dominant stat
    return null;
}


export function TwinskieAvatar({ isInactive }: TwinskieAvatarProps) {
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const getBaseAvatar = (): ImagePlaceholder | undefined => {
      if (!user) {
          return PlaceHolderImages.find(p => p.id === 'twinskie-default');
      }
      const dominantStat = getDominantStat(user);
      if (dominantStat) {
          const avatarId = BASE_AVATAR_MAP[dominantStat];
          return PlaceHolderImages.find(p => p.id === avatarId);
      }
      return PlaceHolderImages.find(p => p.id === 'twinskie-default');
  };

  const baseAvatar = getBaseAvatar();

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
