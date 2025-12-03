'use client';

import { useMemo } from 'react';
import type { User } from '@/lib/types';
import { 
  getDominantSkill, 
  isUserInactive, 
  getEvolutionEffect,
  decodeAvatarConfig,
  SKIN_TONE_COLORS,
  HAIR_COLOR_VALUES,
  type OpenPeepsConfig,
} from '@/lib/avatar-system-openpeeps';
import { cn } from '@/lib/utils';

interface TwinskieAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showInactiveLabel?: boolean;
  showEvolutionBadge?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400,
};

export function TwinskieAvatar({ 
  user, 
  size = 'md',
  showInactiveLabel = true,
  showEvolutionBadge = true,
  className 
}: TwinskieAvatarProps) {
  const pixelSize = SIZE_MAP[size];
  
  const avatarData = useMemo(() => {
    if (!user.avatarStyle) {
      return null;
    }

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
    
    return {
      config,
      dominant,
      inactive,
      evolution,
    };
  }, [user]);

  if (!avatarData) {
    return (
      <div 
        className={cn(
          'rounded-2xl bg-secondary flex items-center justify-center border-2 border-border',
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <span className="text-muted-foreground text-2xl">?</span>
      </div>
    );
  }

  // Get active cosmetic layers
  const activeCosmetics = useMemo(() => {
    if (!user.avatarLayers) return [];
    return Object.keys(user.avatarLayers).filter(key => user.avatarLayers![key]);
  }, [user.avatarLayers]);

  // Build cosmetic CSS effects
  const cosmeticEffects = activeCosmetics.map(id => {
    const cosmetic = require('@/lib/avatar-system-openpeeps').COSMETIC_ITEMS.find((c: any) => c.id === id);
    return cosmetic?.cssEffect;
  }).filter(Boolean).join(', ');

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Glow effect when momentum active */}
      {user.momentumFlameActive && (
        <div
          className="absolute inset-0 rounded-2xl blur-2xl animate-pulse pointer-events-none"
          style={{
            background: avatarData.evolution.glowColor,
            transform: 'scale(1.15)',
          }}
        />
      )}

      {/* Main avatar container */}
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300 bg-gradient-to-br from-background to-secondary',
          avatarData.inactive && 'grayscale opacity-70',
          user.momentumFlameActive && 'ring-4 ring-opacity-50'
        )}
        style={{
          width: pixelSize,
          height: pixelSize,
          borderColor: avatarData.evolution.borderColor,
          borderWidth: 4,
          borderStyle: 'solid',
          boxShadow: user.momentumFlameActive 
            ? `0 0 40px ${avatarData.evolution.glowColor}`
            : '0 4px 6px rgba(0,0,0,0.1)',
          filter: cosmeticEffects || undefined,
        }}
      >
        {/* Open Peeps Character SVG */}
        <OpenPeepsCharacter 
          config={avatarData.config}
          size={pixelSize}
        />

        {/* Cosmetic background effects */}
        {activeCosmetics.map((cosmeticId) => {
          const cosmetic = require('@/lib/avatar-system-openpeeps').COSMETIC_ITEMS.find((c: any) => c.id === cosmeticId);
          if (cosmetic?.type === 'background') {
            return (
              <div
                key={cosmeticId}
                className="absolute inset-0 pointer-events-none"
                style={{ background: cosmetic.cssEffect }}
              />
            );
          }
          return null;
        })}

        {/* Inactive overlay */}
        {avatarData.inactive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <div className="text-6xl opacity-50">😴</div>
          </div>
        )}
      </div>

      {/* Level badge */}
      <div
        className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-background"
        style={{
          width: Math.max(pixelSize * 0.2, 32),
          height: Math.max(pixelSize * 0.2, 32),
          fontSize: pixelSize * 0.1,
        }}
      >
        {user.level}
      </div>

      {/* Evolution badge */}
      {showEvolutionBadge && (
        <div
          className="absolute -top-2 -left-2 text-3xl drop-shadow-lg"
          title={avatarData.evolution.badgeText}
          style={{ fontSize: pixelSize * 0.15 }}
        >
          {avatarData.evolution.badgeText.split(' ')[0]}
        </div>
      )}

      {/* Momentum flame indicator */}
      {user.momentumFlameActive && (
        <div className="absolute top-2 right-2">
          <div className="relative">
            <div className="text-2xl animate-bounce">🔥</div>
            <div className="absolute inset-0 blur-sm bg-orange-500/50 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Inactive label */}
      {avatarData.inactive && showInactiveLabel && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          INACTIVE
        </div>
      )}
    </div>
  );
}

// Open Peeps Character Component
function OpenPeepsCharacter({ 
  config, 
  size 
}: { 
  config: OpenPeepsConfig;
  size: number;
}) {
  const skinColor = SKIN_TONE_COLORS[config.skinTone];
  const hairColor = HAIR_COLOR_VALUES[config.hairColor];

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="w-full h-full"
    >
      {/* Body */}
      <g transform="translate(100, 140)">
        <Body pose={config.body} skinColor={skinColor} />
      </g>

      {/* Head */}
      <g transform="translate(100, 70)">
        <Head shape={config.head} skinColor={skinColor} />
      </g>

      {/* Hair */}
      <g transform="translate(100, 40)">
        <Hair style={config.hair} color={hairColor} />
      </g>

      {/* Face */}
      <g transform="translate(100, 75)">
        <Eyes style={config.eyes} />
        <Eyebrows style={config.eyebrows} />
        <Mouth style={config.mouth} />
      </g>

      {/* Facial Hair (if male and has it) */}
      {config.gender === 'Male' && config.facialHair && config.facialHair !== 'none' && (
        <g transform="translate(100, 90)">
          <FacialHair style={config.facialHair} color={hairColor} />
        </g>
      )}

      {/* Accessories */}
      {config.accessories?.map((accessory, i) => (
        <g key={i} transform="translate(100, 70)">
          <Accessory type={accessory} />
        </g>
      ))}
    </svg>
  );
}

// SVG Body components (simplified Open Peeps style)
function Body({ pose, skinColor }: { pose: string; skinColor: string }) {
  if (pose === 'sitting') {
    return (
      <g>
        <rect x="-20" y="0" width="40" height="50" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="-20" y="50" width="15" height="40" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="5" y="50" width="15" height="40" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      </g>
    );
  }
  
  if (pose === 'arms-crossed') {
    return (
      <g>
        <rect x="-25" y="0" width="50" height="60" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
        <path d="M -25 20 L -40 15 L -40 40 L -25 35" fill={skinColor} stroke="#000" strokeWidth="2" />
        <path d="M 25 20 L 40 15 L 40 40 L 25 35" fill={skinColor} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  // Default standing
  return (
    <g>
      <rect x="-20" y="0" width="40" height="60" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
      <rect x="-35" y="10" width="12" height="40" rx="6" fill={skinColor} stroke="#000" strokeWidth="2" />
      <rect x="23" y="10" width="12" height="40" rx="6" fill={skinColor} stroke="#000" strokeWidth="2" />
      <rect x="-15" y="60" width="12" height="40" rx="6" fill={skinColor} stroke="#000" strokeWidth="2" />
      <rect x="3" y="60" width="12" height="40" rx="6" fill={skinColor} stroke="#000" strokeWidth="2" />
    </g>
  );
}

function Head({ shape, skinColor }: { shape: string; skinColor: string }) {
  return (
    <ellipse cx="0" cy="0" rx="30" ry="35" fill={skinColor} stroke="#000" strokeWidth="2" />
  );
}

function Hair({ style, color }: { style: string; color: string }) {
  if (style === 'none') return null;

  if (style === 'bun') {
    return (
      <g>
        <ellipse cx="0" cy="-10" rx="35" ry="20" fill={color} stroke="#000" strokeWidth="2" />
        <circle cx="0" cy="-25" r="15" fill={color} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (style === 'afro') {
    return (
      <circle cx="0" cy="0" r="45" fill={color} stroke="#000" strokeWidth="2" />
    );
  }

  if (style === 'long1' || style === 'long2') {
    return (
      <g>
        <ellipse cx="0" cy="0" rx="35" ry="25" fill={color} stroke="#000" strokeWidth="2" />
        <rect x="-35" y="10" width="70" height="60" rx="10" fill={color} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  // Short hair default
  return (
    <ellipse cx="0" cy="5" rx="35" ry="20" fill={color} stroke="#000" strokeWidth="2" />
  );
}

function Eyes({ style }: { style: string }) {
  if (style === 'happy') {
    return (
      <g>
        <path d="M -15 0 Q -10 5 -5 0" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M 5 0 Q 10 5 15 0" stroke="#000" strokeWidth="2" fill="none" />
      </g>
    );
  }

  if (style === 'hearts') {
    return (
      <g>
        <text x="-15" y="5" fontSize="12">❤️</text>
        <text x="5" y="5" fontSize="12">❤️</text>
      </g>
    );
  }

  // Normal eyes
  return (
    <g>
      <circle cx="-12" cy="0" r="4" fill="#000" />
      <circle cx="12" cy="0" r="4" fill="#000" />
    </g>
  );
}

function Eyebrows({ style }: { style: string }) {
  return (
    <g>
      <path d="M -20 -8 L -8 -10" stroke="#000" strokeWidth="2" strokeLinecap="round" />
      <path d="M 8 -10 L 20 -8" stroke="#000" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Mouth({ style }: { style: string }) {
  if (style === 'smile') {
    return <path d="M -10 10 Q 0 15 10 10" stroke="#000" strokeWidth="2" fill="none" />;
  }

  if (style === 'frown') {
    return <path d="M -10 15 Q 0 10 10 15" stroke="#000" strokeWidth="2" fill="none" />;
  }

  if (style === 'surprised') {
    return <ellipse cx="0" cy="12" rx="8" ry="10" fill="#fff" stroke="#000" strokeWidth="2" />;
  }

  // Neutral
  return <line x1="-8" y1="12" x2="8" y2="12" stroke="#000" strokeWidth="2" strokeLinecap="round" />;
}

function FacialHair({ style, color }: { style: string; color: string }) {
  if (style === 'stubble') {
    return (
      <g opacity="0.5">
        {Array.from({ length: 30 }).map((_, i) => (
          <circle
            key={i}
            cx={(i % 6 - 2.5) * 8}
            cy={Math.floor(i / 6) * 3 + 10}
            r="0.5"
            fill={color}
          />
        ))}
      </g>
    );
  }

  if (style === 'mediumBeard') {
    return (
      <path
        d="M -20 10 Q -15 25 0 27 Q 15 25 20 10"
        fill={color}
        stroke="#000"
        strokeWidth="2"
      />
    );
  }

  return null;
}

function Accessory({ type }: { type: string }) {
  if (type === 'glasses') {
    return (
      <g>
        <circle cx="-12" cy="0" r="10" fill="none" stroke="#000" strokeWidth="2" />
        <circle cx="12" cy="0" r="10" fill="none" stroke="#000" strokeWidth="2" />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (type === 'sunglasses') {
    return (
      <g>
        <ellipse cx="-12" cy="0" rx="10" ry="8" fill="#333" stroke="#000" strokeWidth="2" />
        <ellipse cx="12" cy="0" rx="10" ry="8" fill="#333" stroke="#000" strokeWidth="2" />
        <line x1="-2" y1="0" x2="2" y2="0" stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (type === 'hat') {
    return (
      <g transform="translate(0, -40)">
        <rect x="-30" y="0" width="60" height="10" rx="5" fill="#DC2626" stroke="#000" strokeWidth="2" />
        <rect x="-20" y="-20" width="40" height="20" rx="5" fill="#DC2626" stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  return null;
}
