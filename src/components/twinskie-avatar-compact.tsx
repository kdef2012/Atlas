'use client';

import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { 
  decodeAvatarConfig, 
  isUserInactive,
  getDominantSkill,
  getEvolutionEffect,
  SKIN_TONE_COLORS,
  HAIR_COLOR_VALUES,
} from '@/lib/avatar-system-openpeeps';

interface TwinskieAvatarCompactProps {
  user: User;
  size?: number;
  showLevel?: boolean;
  showMomentum?: boolean;
  className?: string;
}

export function TwinskieAvatarCompact({ 
  user, 
  size = 48,
  showLevel = true,
  showMomentum = true,
  className 
}: TwinskieAvatarCompactProps) {
  const avatarData = useMemo(() => {
    if (!user.avatarStyle) return null;

    const config = decodeAvatarConfig(user.avatarStyle);
    if (!config) return null;

    const dominant = getDominantSkill({
      physicalStat: user.physicalStat,
      mentalStat: user.mentalStat,
      socialStat: user.socialStat,
      practicalStat: user.practicalStat,
      creativeStat: user.creativeStat,
    });

    const inactive = isUserInactive(user.lastLogTimestamp);
    const evolution = getEvolutionEffect(dominant);
    const skinColor = SKIN_TONE_COLORS[config.skinTone];
    const hairColor = HAIR_COLOR_VALUES[config.hairColor];

    return {
      config,
      dominant,
      inactive,
      evolution,
      skinColor,
      hairColor,
    };
  }, [user]);

  if (!avatarData) {
    return (
      <div
        className={cn('rounded-full bg-secondary border-2 border-border flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground">?</span>
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden transition-all',
          avatarData.inactive && 'grayscale opacity-70',
          user.momentumFlameActive && 'ring-2'
        )}
        style={{
          width: size,
          height: size,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: avatarData.evolution.borderColor,
          boxShadow: user.momentumFlameActive 
            ? `0 0 15px ${avatarData.evolution.glowColor}`
            : 'none',
        }}
      >
        {/* Simple head-only SVG for compact view */}
        <svg viewBox="0 0 100 100" width={size} height={size} className="bg-gradient-to-br from-background to-secondary">
          {/* Head */}
          <ellipse cx="50" cy="50" rx="30" ry="35" fill={avatarData.skinColor} stroke="#000" strokeWidth="2" />
          
          {/* Hair */}
          {avatarData.config.hair !== 'none' && (
            <ellipse cx="50" cy="35" rx="32" ry="22" fill={avatarData.hairColor} stroke="#000" strokeWidth="2" />
          )}
          
          {/* Eyes */}
          <circle cx="40" cy="48" r="3" fill="#000" />
          <circle cx="60" cy="48" r="3" fill="#000" />
          
          {/* Mouth */}
          {avatarData.config.mouth === 'smile' ? (
            <path d="M 42 58 Q 50 62 58 58" stroke="#000" strokeWidth="2" fill="none" />
          ) : (
            <line x1="45" y1="58" x2="55" y2="58" stroke="#000" strokeWidth="2" />
          )}
        </svg>
      </div>

      {/* Level badge */}
      {showLevel && (
        <div
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs border-2 border-background"
          style={{
            width: size * 0.4,
            height: size * 0.4,
            minWidth: 18,
            minHeight: 18,
            fontSize: Math.max(size * 0.15, 10),
          }}
        >
          {user.level}
        </div>
      )}

      {/* Momentum flame */}
      {showMomentum && user.momentumFlameActive && (
        <div className="absolute -top-1 -right-1">
          <span style={{ fontSize: size * 0.3 }}>🔥</span>
        </div>
      )}
    </div>
  );
}
