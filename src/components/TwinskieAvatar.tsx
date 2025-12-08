'use client';

import { ReadyPlayerMeAvatar } from './ready-player-me';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getActiveCosmetics, combineCosmeticEffects } from '@/lib/avatar-cosmetics';
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

  // Get active cosmetics and combine their effects
  const cosmetics = useMemo(() => 
    getActiveCosmetics(user.avatarLayers as Record<string, boolean> | undefined),
    [user.avatarLayers]
  );
  
  const effects = useMemo(() => 
    combineCosmeticEffects(cosmetics),
    [cosmetics]
  );

  // Build the filter effect
  const filterEffect = isInactive ? 'grayscale(1) opacity(0.5)' : effects.filter;

  // Parse border from CSS effect string
  const borderStyle = effects.border.replace('border: ', '');

  // Generate unique ID for this avatar instance
  const avatarId = useMemo(() => `twinskie-${user.id}-${Date.now()}`, [user.id]);

  // Check if user has an avatar URL
  if (!user.avatarUrl) {
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
        ✅ CRITICAL FIX: Inject CSS that targets the img tag directly
        This ensures the filter is applied to the actual image, not just a wrapper
      */}
      {filterEffect !== 'none' && (
        <style>{`
          #${avatarId} img {
            filter: ${filterEffect} !important;
          }
        `}</style>
      )}
      
      <div 
        id={avatarId}
        className={cn(
          "relative rounded-lg overflow-hidden",
          effects.animationClasses.join(' '),
          className
        )}
        style={{ 
          width: pixelSize, 
          height: pixelSize,
          background: effects.background,
          ...(borderStyle && { border: borderStyle })
        }}
      >
        <ReadyPlayerMeAvatar
          avatarUrl={user.avatarUrl}
          size={pixelSize}
          scene={scene}
          className="transition-all duration-300"
        />
        
        {/* Inactive Label */}
        {isInactive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold z-10">
            INACTIVE
          </div>
        )}
        
        {/* Level Badge */}
        {user.level != null && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-10">
            {user.level}
          </div>
        )}
      </div>
    </>
  );
}
