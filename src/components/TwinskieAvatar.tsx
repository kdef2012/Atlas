
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

/**
 * TwinskieAvatar - Displays user's Ready Player Me avatar with cosmetic effects
 * Wrapper component for ReadyPlayerMeAvatar that works with User objects
 */
export function TwinskieAvatar({ 
  user, 
  size = 'md',
  className,
  scene = 'fullbody-portrait-v1',
  showInactiveLabel = false
}: TwinskieAvatarProps) {
  const pixelSize = SIZE_MAP[size];

  // Check if user is inactive (no activity in 24 hours)
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const isInactive = showInactiveLabel && user.lastLogTimestamp < twentyFourHoursAgo;

  // Get active cosmetics and combine their effects
  const cosmetics = useMemo(() => 
    getActiveCosmetics(user.avatarLayers),
    [user.avatarLayers]
  );
  
  const effects = useMemo(() => 
    combineCosmeticEffects(cosmetics),
    [cosmetics]
  );

  // Build container style for background effects
  const containerStyle: React.CSSProperties = {
    background: effects.background,
  };

  // Build avatar style for filter effects
  const avatarStyle: React.CSSProperties = {
    filter: isInactive ? 'grayscale(1) opacity(0.5)' : effects.filter,
  };

  // Parse border from CSS effect string
  const borderStyle = effects.border.replace('border: ', '');

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
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden",
        effects.animationClasses.join(' '),
        className
      )}
      style={{ 
        width: pixelSize, 
        height: pixelSize,
        ...containerStyle,
        ...(borderStyle && { border: borderStyle })
      }}
    >
      {/* Avatar with glow/aura effects */}
      <ReadyPlayerMeAvatar
        avatarUrl={user.avatarUrl}
        size={pixelSize}
        scene={scene}
        className="transition-all duration-300"
        style={avatarStyle}
      />
      
      {/* Particle effects overlay */}
      {cosmetics.some(c => c.type === 'particle') && (
        <div className="absolute inset-0 pointer-events-none">
          {cosmetics
            .filter(c => c.type === 'particle')
            .map(c => (
              <div
                key={c.id}
                className={cn(
                  "absolute inset-0",
                  c.animationClass
                )}
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                }}
              />
            ))}
        </div>
      )}
      
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
  );
}
