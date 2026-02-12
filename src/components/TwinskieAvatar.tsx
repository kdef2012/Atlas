'use client';

import { useMemo } from 'react';
import { buildRpmUrl, getLayerStyles } from '@/lib/avatar-engine';
import { cn } from '@/lib/utils';
import type { User, GeneratedCosmetic } from '@/lib/types';

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

  // 1. Memoize AI Cosmetics with null-safety
  const activeAiCosmetics = useMemo(() => {
    const layers = user.avatarLayers ?? {};
    const aiData = user.aiGeneratedCosmetics ?? {};
    return Object.keys(layers)
      .filter((id) => layers[id] === true && aiData[id])
      .map((id) => aiData[id] as GeneratedCosmetic);
  }, [user.avatarLayers, user.aiGeneratedCosmetics]);

  // 2. Memoize RPM URL with null-safety
  const rpmUrl = useMemo(() => {
    const baseUrl = user.avatarUrl ?? '';
    const layers = user.avatarLayers ?? {};
    const aiData = user.aiGeneratedCosmetics ?? {};
    
    // Static assets are IDs in avatarLayers that ARE NOT in aiGeneratedCosmetics
    const staticAssetIds = Object.keys(layers).filter((id) => !aiData[id] && layers[id]);
    
    return buildRpmUrl(baseUrl, staticAssetIds);
  }, [user.avatarUrl, user.avatarLayers, user.aiGeneratedCosmetics]);

  if (!user.avatarUrl) {
    return (
      <div className={cn("bg-secondary animate-pulse rounded-xl", dimensions, className)} />
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center", dimensions, className)}>
      
      {/* 1. Background Layers (Aura/Background) */}
      {activeAiCosmetics
        .filter((c) => c.position === 'aura' || c.position === 'background')
        .map((cosmetic) => (
          <div
            key={cosmetic.id}
            style={{ 
              ...getLayerStyles(cosmetic.position), 
              ...(cosmetic.cssEffects as React.CSSProperties) 
            }}
            className="animate-in fade-in zoom-in duration-1000"
            dangerouslySetInnerHTML={{ __html: cosmetic.svgCode }}
          />
        ))}

      {/* 2. Ready Player Me Base Render */}
      <img
        src={rpmUrl}
        alt={`${user.userName}'s Avatar`}
        className="relative z-10 w-full h-full object-contain"
      />

      {/* 3. Foreground Layers (Head/Face/Body) */}
      {activeAiCosmetics
        .filter((c) => c.position !== 'aura' && c.position !== 'background')
        .map((cosmetic) => (
          <div
            key={cosmetic.id}
            style={{ 
              ...getLayerStyles(cosmetic.position), 
              ...(cosmetic.cssEffects as React.CSSProperties) 
            }}
            className="z-20 animate-in slide-in-from-top-2 duration-500"
            dangerouslySetInnerHTML={{ __html: cosmetic.svgCode }}
          />
        ))}
    </div>
  );
}
