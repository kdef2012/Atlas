
'use client';

import { useMemo } from 'react';
import { buildRpmUrl, getLayerStyles } from '@/lib/avatar-engine';
import { cn } from '@/lib/utils';
import type { User, GeneratedCosmetic } from '@/lib/types';
import { COSMETIC_ITEMS, type CosmeticItem } from '@/lib/avatar-cosmetics';
import Image from 'next/image';

interface TwinskieAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-24 h-24',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-80 h-80',
};

export function TwinskieAvatar({ user, size = 'md', className }: TwinskieAvatarProps) {
  const dimensions = SIZE_MAP[size];

  const activeLayers = useMemo(() => user.avatarLayers ?? {}, [user.avatarLayers]);

  // 1. Get active AI-generated cosmetics (SVG overlays)
  const activeAiCosmetics = useMemo(() => {
    const aiData = user.aiGeneratedCosmetics ?? {};
    return Object.keys(activeLayers)
      .filter((id) => activeLayers[id] === true && aiData[id])
      .map((id) => aiData[id] as GeneratedCosmetic);
  }, [activeLayers, user.aiGeneratedCosmetics]);

  // 2. Get active static cosmetics (image overlays, CSS effects)
  const activeStaticCosmetics = useMemo(() => {
    return COSMETIC_ITEMS.filter(item => activeLayers[item.id] === true);
  }, [activeLayers]);
  
  // Combine all active cosmetics for effect calculation
  const allActiveCosmetics = [...activeAiCosmetics, ...activeStaticCosmetics];

  // 3. Memoize the base RPM URL (now without any asset modifications)
  const rpmUrl = useMemo(() => {
    if (!user.avatarUrl) return '';
    // The buildRpmUrl function is now simplified in avatar-engine to just create the transparent PNG URL
    return buildRpmUrl(user.avatarUrl, []);
  }, [user.avatarUrl]);

  // 4. Combine CSS effects from all active cosmetics
  const combinedEffects = useMemo(() => {
    const effects: React.CSSProperties = {};
    const backgrounds: string[] = [];

    allActiveCosmetics.forEach(cosmetic => {
        // AI cosmetics have cssEffects object, static have individual props
        const css = cosmetic.cssEffects ?? {};
        
        if (css.background || (cosmetic as CosmeticItem).backgroundGradient) {
            backgrounds.push(css.background || (cosmetic as CosmeticItem).backgroundGradient!);
        }
        if (css.boxShadow || (cosmetic as CosmeticItem).boxShadow) {
            effects.boxShadow = `${effects.boxShadow || ''}, ${css.boxShadow || (cosmetic as CosmeticItem).boxShadow}`.trim().replace(/^,/, '');
        }
        if (css.border || (cosmetic as CosmeticItem).border) {
            effects.border = css.border || (cosmetic as CosmeticItem).border;
        }
        if (css.filter) {
            effects.filter = `${effects.filter || ''} ${css.filter}`.trim();
        }
    });

    if (backgrounds.length > 0) {
        effects.background = backgrounds.join(', ');
    }

    return effects;
  }, [allActiveCosmetics]);


  if (!user.avatarUrl) {
    return (
      <div className={cn("bg-secondary animate-pulse rounded-xl", dimensions, className)} />
    );
  }

  return (
    <div 
        className={cn("relative flex items-center justify-center rounded-lg", dimensions, className)}
        style={combinedEffects}
    >
      
      {/* 1. Base Ready Player Me Render (Transparent) */}
      <img
        src={rpmUrl}
        alt={`${user.userName}'s Avatar`}
        className="relative z-10 w-full h-full object-contain"
      />

      {/* 2. AI-Generated SVG Overlays */}
      {activeAiCosmetics
        .map((cosmetic) => (
          <div
            key={cosmetic.id}
            style={{ 
              ...getLayerStyles(cosmetic.position), 
            }}
            className="z-20"
            dangerouslySetInnerHTML={{ __html: cosmetic.svgCode }}
          />
        ))}
        
      {/* 3. Static Image Overlays (from store, etc.) */}
      {activeStaticCosmetics
        .filter(item => item.type === 'overlay' && item.imageUrl)
        .map((item) => (
             <img
                key={item.id}
                src={item.imageUrl}
                alt={item.name}
                className="absolute z-20"
                style={{ ...getLayerStyles('body') }} // Assuming most overlays are 'body' type
            />
        ))}
    </div>
  );
}
