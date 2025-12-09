
'use client';

import { ReadyPlayerMeAvatar } from './ready-player-me';
import type { User, GeneratedCosmetic } from '@/lib/types';
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

  // Get active STATIC cosmetics from the predefined list
  const staticCosmetics = useMemo(() => 
    getActiveCosmetics(user.avatarLayers as Record<string, boolean> | undefined),
    [user.avatarLayers]
  );
  
  // Build modified avatar URL with URL parameters from STATIC cosmetics
  const modifiedAvatarUrl = useMemo(() => {
    if (!user.avatarUrl) return null;
    return buildAvatarUrl(user.avatarUrl, staticCosmetics);
  }, [user.avatarUrl, staticCosmetics]);
  
  // Get visual effects (glows, borders, backgrounds) from STATIC cosmetics
  const staticEffects = useMemo(() => 
    combineCosmeticEffects(staticCosmetics),
    [staticCosmetics]
  );
  
  // Get active AI-generated cosmetics
  const aiCosmetics = useMemo(() => {
    if (!user.avatarLayers || !user.aiGeneratedCosmetics) return [];
    
    return Object.entries(user.avatarLayers)
      .filter(([id, enabled]) => enabled && user.aiGeneratedCosmetics?.[id])
      .map(([id]) => user.aiGeneratedCosmetics![id]);
  }, [user.avatarLayers, user.aiGeneratedCosmetics]);
  
  // Combine CSS effects from AI cosmetics
  const aiEffects = useMemo(() => {
    const shadows: string[] = [];
    const backgrounds: string[] = [];
    let border = '';
    
    aiCosmetics.forEach(cosmetic => {
      if (cosmetic.cssEffects?.boxShadow) {
        shadows.push(cosmetic.cssEffects.boxShadow);
      }
      if (cosmetic.cssEffects?.background) {
        backgrounds.push(cosmetic.cssEffects.background);
      }
      if (cosmetic.cssEffects?.border) {
        border = cosmetic.cssEffects.border;
      }
    });
    
    return {
      boxShadow: shadows.join(', '),
      background: backgrounds.join(', '),
      border,
    };
  }, [aiCosmetics]);

  // Combine effects from both systems
  const combinedEffects = useMemo(() => {
    const allBoxShadows = [staticEffects.boxShadow, aiEffects.boxShadow].filter(Boolean).join(', ');
    const allBackgrounds = [staticEffects.background, aiEffects.background].filter(Boolean).join(', ');
    
    return {
      boxShadow: allBoxShadows || 'none',
      background: allBackgrounds || 'transparent',
      border: aiEffects.border || staticEffects.border, // Prioritize AI border
      animationClasses: staticEffects.animationClasses,
    }
  }, [staticEffects, aiEffects]);


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
      {/* Outer container - for glow effect */}
      <div 
        className={cn(
          "relative",
          combinedEffects.animationClasses.join(' '),
          isInactive && "opacity-50 grayscale",
          className
        )}
        style={{ 
          width: pixelSize, 
          height: pixelSize,
          boxShadow: combinedEffects.boxShadow,
        }}
      >
        {/* Inner container - for background and border */}
        <div
          className="relative w-full h-full rounded-lg overflow-hidden"
          style={{
            background: combinedEffects.background,
            ...(combinedEffects.border && { border: combinedEffects.border })
          }}
        >
          {/* Base Avatar */}
          <ReadyPlayerMeAvatar
            avatarUrl={modifiedAvatarUrl}
            size={pixelSize}
            scene={scene}
            className="transition-all duration-300"
          />

          {/* AI-Generated SVG Overlays */}
          {aiCosmetics.map((cosmetic) => (
            cosmetic.svgCode && cosmetic.overlayPosition && (
              <div
                key={cosmetic.id}
                className="absolute pointer-events-none"
                style={{
                  ...cosmetic.overlayPosition,
                }}
                dangerouslySetInnerHTML={{ __html: cosmetic.svgCode }}
              />
            )
          ))}
          
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
