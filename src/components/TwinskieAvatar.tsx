'use client';

import { ReadyPlayerMeAvatar } from './ready-player-me';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getActiveCosmetics, combineCosmeticEffects, buildAvatarUrl } from '@/lib/avatar-cosmetics';
import { useMemo } from 'react';

interface TwinskieAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  scene?: 'fullbody-portrait-v1' | 'halfbody-portrait-v1' | 'bust-portrait-v1';
  showInactiveLabel?: boolean;
}

const SIZE_MAP = {
  sm: 150,
  md: 250,
  lg: 350,
  xl: 450,
};

export function TwinskieAvatar({ 
  user, 
  size = 'md',
  className,
  scene = 'fullbody-portrait-v1',
  showInactiveLabel = false
}: TwinskieAvatarProps) {
  const pixelSize = SIZE_MAP[size];

  // Check if user is inactive
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const isInactive = showInactiveLabel && user.lastLogTimestamp < twentyFourHoursAgo;

  // Get active cosmetics
  const cosmetics = useMemo(() => 
    getActiveCosmetics(user.avatarLayers as Record<string, boolean> | undefined),
    [user.avatarLayers]
  );
  
  // Build modified avatar URL with URL parameters
  // ✅ buildAvatarUrl now automatically adds ?background=transparent if background cosmetics are active!
  const modifiedAvatarUrl = useMemo(() => {
    if (!user.avatarUrl) return null;
    return buildAvatarUrl(user.avatarUrl, cosmetics);
  }, [user.avatarUrl, cosmetics]);
  
  // Get visual effects (glows, borders, backgrounds)
  const effects = useMemo(() => 
    combineCosmeticEffects(cosmetics),
    [cosmetics]
  );

  // Check if user has an avatar URL
  if (!user.avatarUrl || !modifiedAvatarUrl) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg border-2 border-dashed",
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <div className="text-center p-4">
          <p className="text-muted-foreground text-sm">No Avatar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 
        ✅ SOLUTION: With transparent background, this is simple!
        - Outer div: Handles glow (box-shadow)
        - Inner div: Handles background + border
        - Avatar has transparent background so it doesn't cover the gradient!
      */}
      
      {/* Outer container - for glow effect */}
      <div 
        className={cn(
          "relative",
          effects.animationClasses.join(' '),
          isInactive && "opacity-50 grayscale",
          className
        )}
        style={{ 
          width: pixelSize, 
          height: pixelSize,
          // ✅ Box-shadow (glow) on outer container
          boxShadow: effects.boxShadow,
        }}
      >
        {/* Inner container - for background and border */}
        <div
          className="relative w-full h-full rounded-lg overflow-hidden"
          style={{
            // ✅ Background on inner container - now visible through transparent avatar!
            background: effects.background,
            // ✅ Border on inner container
            ...(effects.border && { border: effects.border })
          }}
        >
          {/* Avatar with transparent background */}
          <ReadyPlayerMeAvatar
            avatarUrl={modifiedAvatarUrl} // ✅ Has ?background=transparent parameter!
            size={pixelSize}
            scene={scene}
            className="transition-all duration-300"
          />
          
          {/* Inactive Label */}
          {isInactive && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold z-20">
              INACTIVE
            </div>
          )}
          
          {/* Level Badge */}
          {user.level != null && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-20">
              {user.level}
            </div>
          )}
        </div>
      </div>
    </>
  );
}