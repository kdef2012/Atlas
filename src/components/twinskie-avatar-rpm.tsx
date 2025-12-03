'use client';

import { useMemo } from 'react';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

// Helper functions for avatar evolution
type DominantSkill = 'Physical' | 'Mental' | 'Social' | 'Practical' | 'Creative';

function getDominantSkill(user: User): DominantSkill {
  const skills = {
    Physical: user.physicalStat || 0,
    Mental: user.mentalStat || 0,
    Social: user.socialStat || 0,
    Practical: user.practicalStat || 0,
    Creative: user.creativeStat || 0,
  };

  let maxSkill: DominantSkill = 'Physical';
  let maxValue = skills.Physical;

  for (const [skill, value] of Object.entries(skills)) {
    if (value > maxValue) {
      maxValue = value;
      maxSkill = skill as DominantSkill;
    }
  }

  return maxSkill;
}

function isUserInactive(user: User): boolean {
  if (!user.lastLogTimestamp) return false;
  const hoursSinceLastLog = (Date.now() - user.lastLogTimestamp) / (1000 * 60 * 60);
  return hoursSinceLastLog > 24;
}

function getEvolutionEffect(skill: DominantSkill) {
  const effects = {
    Physical: {
      borderColor: '#DC2626',
      glowColor: '#DC2626',
      badgeText: '💪',
      auraEffect: true,
    },
    Mental: {
      borderColor: '#2563EB',
      glowColor: '#2563EB',
      badgeText: '🧠',
      auraEffect: true,
    },
    Social: {
      borderColor: '#9333EA',
      glowColor: '#9333EA',
      badgeText: '🤝',
      auraEffect: true,
    },
    Practical: {
      borderColor: '#16A34A',
      glowColor: '#16A34A',
      badgeText: '🔧',
      auraEffect: true,
    },
    Creative: {
      borderColor: '#CA8A04',
      glowColor: '#CA8A04',
      badgeText: '🎨',
      auraEffect: true,
    },
  };

  return effects[skill];
}

interface TwinskieAvatarRPMProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  scene?: 'fullbody-portrait-v1' | 'halfbody-portrait-v1' | 'bust-portrait-v1';
  showInactiveLabel?: boolean;
  showEvolutionBadge?: boolean;
  showLevelBadge?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400,
};

/**
 * Twinskie Avatar with Ready Player Me + Evolution System
 * Combines realistic RPM avatars with your skill-based evolution effects
 */
export function TwinskieAvatarRPM({
  user,
  size = 'lg',
  scene = 'fullbody-portrait-v1',
  showInactiveLabel = true,
  showEvolutionBadge = true,
  showLevelBadge = true,
  className = '',
}: TwinskieAvatarRPMProps) {
  const pixelSize = SIZE_MAP[size];
  const inactive = isUserInactive(user);
  const dominantSkill = getDominantSkill(user);
  const evolution = getEvolutionEffect(dominantSkill);

  // Convert GLB to PNG if needed
  const avatarImageUrl = useMemo(() => {
    if (!user.avatarUrl) return null;
    
    if (user.avatarUrl.includes('.png')) {
      return user.avatarUrl;
    }
    
    // Convert .glb to .png with scene parameter
    return `${user.avatarUrl.replace('.glb', '.png')}?scene=${scene}`;
  }, [user.avatarUrl, scene]);

  // Check if user has cosmetic layers equipped
  const hasCosmetics = user.avatarLayers && Object.values(user.avatarLayers).some(v => v === true);

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-xl transition-all duration-300",
        className
      )}
      style={{ 
        width: pixelSize, 
        height: pixelSize,
        border: `3px solid ${evolution.borderColor}`,
        boxShadow: user.momentumFlameActive ? `0 0 20px ${evolution.glowColor}` : 'none',
      }}
    >
      {/* Main Avatar Image */}
      <div 
        className={cn(
          "relative w-full h-full overflow-hidden rounded-lg transition-all duration-500",
          inactive && "grayscale opacity-70"
        )}
      >
        {avatarImageUrl ? (
          <img
            src={avatarImageUrl}
            alt={`${user.userName}'s Twinskie`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-4xl">👤</span>
          </div>
        )}

        {/* Aura Effect Based on Skill */}
        {user.momentumFlameActive && evolution.auraEffect && (
          <div 
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              background: `radial-gradient(circle at center, ${evolution.glowColor}20, transparent 70%)`,
            }}
          />
        )}

        {/* Cosmetic Effects Overlay */}
        {hasCosmetics && user.avatarLayers && (
          <div className="absolute inset-0 pointer-events-none">
            {user.avatarLayers.newbie_glow && (
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent animate-pulse" />
            )}
            {user.avatarLayers.shadow_aura && (
              <div className="absolute inset-0 bg-gradient-radial from-purple-900/30 to-transparent" />
            )}
            {user.avatarLayers.champion_aura && (
              <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 via-transparent to-gold-400/20 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Evolution Badge (Top Left) */}
      {showEvolutionBadge && evolution.badgeText && !inactive && (
        <div 
          className="absolute top-2 left-2 text-2xl drop-shadow-lg animate-bounce"
          title={`${dominantSkill} Focus`}
        >
          {evolution.badgeText}
        </div>
      )}

      {/* Momentum Flame Indicator (Top Right) */}
      {user.momentumFlameActive && !inactive && (
        <div 
          className="absolute top-2 right-2 text-2xl animate-pulse drop-shadow-lg"
          title="Momentum Active!"
        >
          🔥
        </div>
      )}

      {/* Level Badge (Bottom Right) */}
      {showLevelBadge && (
        <div 
          className="absolute bottom-2 right-2 bg-primary text-primary-foreground font-bold rounded-full px-3 py-1 text-sm shadow-lg"
          style={{ 
            minWidth: '40px',
            textAlign: 'center',
          }}
        >
          Lv {user.level}
        </div>
      )}

      {/* Inactive Overlay */}
      {inactive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg">
          <span className="text-4xl mb-2 animate-pulse">😴</span>
          {showInactiveLabel && (
            <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">
              INACTIVE
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for navigation/lists
 */
interface TwinskieAvatarCompactRPMProps {
  user: User;
  size?: number;
  showLevel?: boolean;
  showMomentum?: boolean;
  className?: string;
}

export function TwinskieAvatarCompactRPM({
  user,
  size = 48,
  showLevel = true,
  showMomentum = true,
  className = '',
}: TwinskieAvatarCompactRPMProps) {
  const inactive = isUserInactive(user);
  const dominantSkill = getDominantSkill(user);
  const evolution = getEvolutionEffect(dominantSkill);

  // Use bust portrait for compact view
  const avatarImageUrl = useMemo(() => {
    if (!user.avatarUrl) return null;
    
    if (user.avatarUrl.includes('.png')) {
      // If already PNG, add bust scene if not present
      return user.avatarUrl.includes('?scene=') 
        ? user.avatarUrl 
        : `${user.avatarUrl}?scene=bust-portrait-v1`;
    }
    
    return `${user.avatarUrl.replace('.glb', '.png')}?scene=bust-portrait-v1`;
  }, [user.avatarUrl]);

  return (
    <div 
      className={cn("relative flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-full overflow-hidden transition-all",
          inactive && "grayscale opacity-70"
        )}
        style={{ 
          border: `2px solid ${evolution.borderColor}`,
        }}
      >
        {avatarImageUrl ? (
          <img
            src={avatarImageUrl}
            alt={user.userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-xl">👤</span>
          </div>
        )}
      </div>

      {/* Level Badge */}
      {showLevel && (
        <div 
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center shadow-lg"
          style={{ 
            width: Math.max(size * 0.4, 18),
            height: Math.max(size * 0.4, 18),
            fontSize: Math.max(size * 0.25, 10),
          }}
        >
          {user.level}
        </div>
      )}

      {/* Momentum Indicator */}
      {showMomentum && user.momentumFlameActive && !inactive && (
        <div 
          className="absolute -top-1 -right-1 animate-pulse"
          style={{ fontSize: Math.max(size * 0.3, 12) }}
        >
          🔥
        </div>
      )}
    </div>
  );
}
