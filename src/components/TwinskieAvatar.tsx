'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

interface TwinskieAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showInactiveLabel?: boolean;
}

const SIZE_MAP = {
  sm: 'w-24 h-24',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-80 h-80',
};

/**
 * Standard TwinskieAvatar component.
 * Displays the high-fidelity AI-generated render.
 */
export function TwinskieAvatar({ user, size = 'md', className, showInactiveLabel = true }: TwinskieAvatarProps) {
  const dimensions = SIZE_MAP[size];
  const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
  const isInactive = user.lastLogTimestamp < twentyFourHoursAgo;

  if (!user.avatarUrl) {
    return (
      <div className={cn("bg-secondary animate-pulse rounded-2xl flex items-center justify-center", dimensions, className)}>
        <span className="text-muted-foreground font-headline font-bold">Initializing...</span>
      </div>
    );
  }

  return (
    <div 
        className={cn(
          "relative flex items-center justify-center rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border shadow-inner transition-all duration-500", 
          dimensions, 
          className
        )}
    >
      <img
        src={user.avatarUrl}
        alt={`${user.userName}'s Twinskie`}
        className={cn(
          "relative z-10 w-[90%] h-[90%] object-contain drop-shadow-2xl transition-all duration-700",
          isInactive && "grayscale-[0.5] opacity-80"
        )}
      />
      
      {/* Dynamic glow based on archetype */}
      <div className={cn(
        "absolute inset-0 opacity-30 blur-3xl transition-colors duration-1000",
        user.archetype === 'Titan' && "bg-red-500",
        user.archetype === 'Sage' && "bg-blue-500",
        user.archetype === 'Maverick' && "bg-yellow-500"
      )} />

      {isInactive && showInactiveLabel && (
        <div className="absolute bottom-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
          <span className="text-[10px] font-black text-white/80 tracking-[0.2em] uppercase">Inactive Signal</span>
        </div>
      )}
    </div>
  );
}
