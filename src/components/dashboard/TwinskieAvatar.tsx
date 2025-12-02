
import type { SkillCategory } from "@/lib/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceHolderImages, type ImagePlaceholder } from "@/lib/placeholder-images";

interface TwinskieAvatarProps {
  dominantCategory: SkillCategory | 'None';
  isInactive: boolean;
}

export function TwinskieAvatar({ dominantCategory, isInactive }: TwinskieAvatarProps) {
  const getAvatarData = (): ImagePlaceholder | undefined => {
    switch (dominantCategory) {
      case 'Physical':
        return PlaceHolderImages.find(p => p.id === 'twinskie-physical');
      case 'Practical':
        return PlaceHolderImages.find(p => p.id === 'twinskie-practical');
      case 'Creative':
        return PlaceHolderImages.find(p => p.id === 'twinskie-creative');
      case 'Mental':
        return PlaceHolderImages.find(p => p.id === 'twinskie-mental');
      case 'Social':
         return PlaceHolderImages.find(p => p.id === 'twinskie-social');
      default:
        return PlaceHolderImages.find(p => p.id === 'twinskie-default');
    }
  };

  const avatarData = getAvatarData();

  return (
    <div className={cn(
      "relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/50 flex items-center justify-center transition-all duration-500",
      isInactive && "grayscale animate-pulse"
    )}>
      {avatarData && (
        <Image
          src={avatarData.imageUrl}
          alt={avatarData.description}
          width={400}
          height={400}
          data-ai-hint={avatarData.imageHint}
          className={cn("object-cover transition-transform duration-500", isInactive && "scale-95")}
        />
      )}
       {isInactive && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <p className="text-white font-bold text-lg font-headline animate-pulse">Inactive</p>
        </div>
      )}
    </div>
  );
}
