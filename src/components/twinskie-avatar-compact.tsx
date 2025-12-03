'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isUserInactive, SKIN_TONES, type SkinTone } from '@/lib/avatar-system';

interface TwinskieAvatarCompactProps {
  user: User;
  size?: number;
  showLevel?: boolean;
  className?: string;
}

export function TwinskieAvatarCompact({ 
  user, 
  size = 40,
  showLevel = false,
  className 
}: TwinskieAvatarCompactProps) {
  const skinTone = (user.avatarStyle?.split('-')[2] as SkinTone) || 'medium';
  const skinColor = SKIN_TONES[skinTone];
  const style = user.avatarStyle?.split('-')[3] || '1';
  const hairColors = ['#8B4513', '#FFD700', '#000000'];
  const hairColor = hairColors[parseInt(style) - 1];
  const inactive = isUserInactive(user.lastLogTimestamp);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={cn(
          'rounded-full border-2 transition-all',
          user.momentumFlameActive ? 'border-primary' : 'border-border',
          inactive && 'grayscale opacity-70'
        )}
      >
        {/* Background */}
        <circle cx="50" cy="50" r="48" fill="hsl(var(--background))" />
        
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill={skinColor} stroke="currentColor" strokeWidth="2" />
        
        {/* Hair */}
        <ellipse cx="50" cy="35" rx="32" ry="20" fill={hairColor} stroke="currentColor" strokeWidth="2" />
        
        {/* Eyes */}
        <circle cx="42" cy="48" r="3" fill="currentColor" />
        <circle cx="58" cy="48" r="3" fill="currentColor" />
        
        {/* Mouth */}
        <line x1="45" y1="60" x2="55" y2="60" stroke="currentColor" strokeWidth="2" />
      </svg>

      {/* Level Badge */}
      {showLevel && (
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
          {user.level}
        </div>
      )}

      {/* Momentum Flame Indicator */}
      {user.momentumFlameActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
