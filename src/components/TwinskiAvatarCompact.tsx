'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TwinskieAvatarCompactProps {
  user: User;
  size?: number;
  className?: string;
  showInactive?: boolean;
}

/**
 * TwinskieAvatarCompact - Small circular avatar for lists and cards.
 * Now standardized for AI-generated images and Union Avatars.
 */
export function TwinskieAvatarCompact({ 
  user, 
  size = 40,
  className,
  showInactive = true
}: TwinskieAvatarCompactProps) {
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const isInactive = showInactive && user.lastLogTimestamp < twentyFourHoursAgo;

  if (!user.avatarUrl) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-secondary rounded-full border border-border",
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
    <div 
      className={cn("relative rounded-full overflow-hidden border-2 border-border bg-card shadow-sm", className)}
      style={{ width: size, height: size }}
    >
      <img
        src={user.avatarUrl}
        alt={user.userName}
        className={cn(
          "h-full w-full object-cover",
          isInactive && "opacity-50 grayscale"
        )}
      />
      
      {isInactive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
          <span className="text-[8px] font-black text-white tracking-tighter">OFFLINE</span>
        </div>
      )}
    </div>
  );
}
