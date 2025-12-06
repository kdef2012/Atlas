'use client';

import { ReadyPlayerMeAvatar } from './ready-player-me';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TwinskieAvatarCompactProps {
  user: User;
  size?: number;
  className?: string;
  showInactive?: boolean;
}

/**
 * TwinskieAvatarCompact - Small circular avatar for lists and cards
 */
export function TwinskieAvatarCompact({ 
  user, 
  size = 40,
  className,
  showInactive = true
}: TwinskieAvatarCompactProps) {
  // Check if user is inactive (no activity in 24 hours)
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const isInactive = showInactive && user.lastLogTimestamp < twentyFourHoursAgo;

  // Check if user has an avatar URL
  if (!user.avatarUrl) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted rounded-full border",
          isInactive && "opacity-50 grayscale",
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold text-muted-foreground">
          {user.userName?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-full overflow-hidden border-2 border-border", className)}>
      <ReadyPlayerMeAvatar
        avatarUrl={user.avatarUrl}
        size={size}
        scene="bust-portrait-v1"
        className={cn(
          "rounded-full",
          isInactive && "opacity-50 grayscale"
        )}
      />
      
      {/* Inactive indicator */}
      {isInactive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <span className="text-[8px] font-bold text-white">OFFLINE</span>
        </div>
      )}
    </div>
  );
}
