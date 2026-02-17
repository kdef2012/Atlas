
'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

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
 * The TwinskieAvatar component renders a single, pre-generated avatar image.
 * The complex work of layering cosmetics is handled by an AI image generation model,
 * which produces the final `avatarUrl`. This component simply displays that result.
 */
export function TwinskieAvatar({ user, size = 'md', className }: TwinskieAvatarProps) {
  const dimensions = SIZE_MAP[size];

  if (!user.avatarUrl) {
    return (
      <div className={cn("bg-secondary animate-pulse rounded-xl", dimensions, className)} />
    );
  }

  return (
    <div 
        className={cn("relative flex items-center justify-center rounded-lg", dimensions, className)}
    >
      <img
        src={user.avatarUrl}
        alt={`${user.userName}'s Avatar`}
        className="relative z-10 w-full h-full object-contain"
      />
    </div>
  );
}
