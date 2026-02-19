'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TwinskieAvatarCompactProps {
  user: User;
  size?: number;
  className?: string;
  showInactive?: boolean;
  showLevel?: boolean;
}

/**
 * TwinskieAvatarCompact - Small circular avatar for lists and cards.
 * Now standardized for AI-generated images.
 */
export function TwinskieAvatarCompact({ 
  user, 
  size = 40,
  className,
  showInactive = true,
  showLevel = false
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
        <span className="font-bold text-muted-foreground" style={{ fontSize: size * 0.4 }}>
          {user.userName?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div 
        className={cn(
          "relative rounded-full overflow-hidden border-2 border-border bg-secondary/30 shadow-sm transition-all duration-300", 
          user.archetype === 'Titan' && "border-red-500/30",
          user.archetype === 'Sage' && "border-blue-500/30",
          user.archetype === 'Maverick' && "border-yellow-500/30",
          className
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={user.avatarUrl}
          alt={user.userName}
          className={cn(
            "h-full w-full object-contain scale-110",
            isInactive && "opacity-50 grayscale"
          )}
        />
        
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="text-[8px] font-black text-white/80 tracking-tighter uppercase">Off</span>
          </div>
        )}
      </div>
      
      {showLevel && (
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-black px-1 rounded-sm border border-background">
          {user.level}
        </div>
      )}
    </div>
  );
}
