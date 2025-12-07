'use client';

import { ReadyPlayerMeAvatar } from './ready-player-me';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TwinskieAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  scene?: 'fullbody-portrait-v1' | 'halfbody-portrait-v1' | 'bust-portrait-v1';
  showInactiveLabel?: boolean; // ✅ ADDED
}

const SIZE_MAP = {
  sm: 150,
  md: 250,
  lg: 350,
  xl: 450,
};

/**
 * TwinskieAvatar - Displays user's Ready Player Me avatar
 * Wrapper component for ReadyPlayerMeAvatar that works with User objects
 */
export function TwinskieAvatar({ 
  user, 
  size = 'md',
  className,
  scene = 'fullbody-portrait-v1',
  showInactiveLabel = false // ✅ ADDED
}: TwinskieAvatarProps) {
  const pixelSize = SIZE_MAP[size];

  // Check if user is inactive (no activity in 24 hours)
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const isInactive = showInactiveLabel && user.lastLogTimestamp < twentyFourHoursAgo;

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
    <div className={cn("relative", className)}>
      <ReadyPlayerMeAvatar
        avatarUrl={user.avatarUrl}
        size={pixelSize}
        scene={scene}
        className={cn(
          "rounded-lg",
          isInactive && "opacity-50 grayscale"
        )}
      />
      
      {/* Inactive Label */}
      {isInactive && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold">
          INACTIVE
        </div>
      )}
      
      {/* Level Badge */}
      {user.level && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
          {user.level}
        </div>
      )}
    </div>
  );
}
