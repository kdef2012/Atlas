'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

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

/**
 * Standard TwinskieAvatar component.
 * Displays the high-fidelity AI-generated render or the base Union Avatar.
 */
export function TwinskieAvatar({ user, size = 'md', className }: TwinskieAvatarProps) {
  const dimensions = SIZE_MAP[size];

  if (!user.avatarUrl) {
    return (
      <div className={cn("bg-secondary animate-pulse rounded-2xl flex items-center justify-center", dimensions, className)}>
        <span className="text-muted-foreground font-headline font-bold">Lvl {user.level}</span>
      </div>
    );
  }

  return (
    <div 
        className={cn("relative flex items-center justify-center rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border shadow-inner", dimensions, className)}
    >
      <img
        src={user.avatarUrl}
        alt={`${user.userName}'s Twinskie`}
        className="relative z-10 w-full h-full object-contain p-2"
      />
      
      {/* Dynamic glow based on archetype */}
      <div className={cn(
        "absolute inset-0 opacity-20 blur-2xl",
        user.archetype === 'Titan' && "bg-red-500",
        user.archetype === 'Sage' && "bg-blue-500",
        user.archetype === 'Maverick' && "bg-yellow-500"
      )} />
    </div>
  );
}
