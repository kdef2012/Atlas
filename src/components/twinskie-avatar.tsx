'use client';

import { useMemo } from 'react';
import type { User } from '@/lib/types';
import { 
  getDominantSkill, 
  isUserInactive, 
  getEvolutionStyle, 
  SKIN_TONES,
  type BodyType,
  type SkinTone,
} from '@/lib/avatar-system';
import { cn } from '@/lib/utils';

interface TwinskieAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showInactiveLabel?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { width: 80, height: 120 },
  md: { width: 160, height: 240 },
  lg: { width: 240, height: 360 },
  xl: { width: 320, height: 480 },
};

export function TwinskieAvatar({ 
  user, 
  size = 'md',
  showInactiveLabel = true,
  className 
}: TwinskieAvatarProps) {
  const dimensions = SIZE_MAP[size];
  
  const avatarData = useMemo(() => {
    const dominant = getDominantSkill({
      physicalStat: user.physicalStat,
      mentalStat: user.mentalStat,
      socialStat: user.socialStat,
      practicalStat: user.practicalStat,
      creativeStat: user.creativeStat,
    });

    const inactive = isUserInactive(user.lastLogTimestamp);
    const evolution = getEvolutionStyle(dominant);
    const skinColor = SKIN_TONES[(user.avatarStyle?.split('-')[2] as SkinTone) || 'medium'];
    
    return {
      dominant,
      inactive,
      evolution,
      skinColor,
      bodyType: user.avatarStyle?.split('-')[1] as BodyType || 'average',
      gender: user.gender || 'Female',
      style: user.avatarStyle?.split('-')[3] || '1',
    };
  }, [user]);

  // Get active cosmetic layers
  const activeCosmetics = useMemo(() => {
    if (!user.avatarLayers) return [];
    return Object.keys(user.avatarLayers).filter(key => user.avatarLayers![key]);
  }, [user.avatarLayers]);

  return (
    <div className={cn('relative inline-block', className)}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 200 300"
        className={cn(
          'transition-all duration-300',
          avatarData.inactive && 'grayscale opacity-70'
        )}
      >
        {/* Background Aura - shows when momentum flame active */}
        {user.momentumFlameActive && (
          <AuraLayer color={avatarData.evolution.auraColor} />
        )}

        {/* Base Body */}
        <BaseBody
          skinColor={avatarData.skinColor}
          bodyType={avatarData.bodyType}
          gender={avatarData.gender}
          dominantSkill={avatarData.dominant}
        />

        {/* Head */}
        <Head
          skinColor={avatarData.skinColor}
          style={avatarData.style}
          expression={avatarData.evolution.expression}
        />

        {/* Cosmetic Layers - rendered in order */}
        {activeCosmetics.map((itemId) => (
          <CosmeticLayer key={itemId} itemId={itemId} />
        ))}

        {/* Inactive overlay */}
        {avatarData.inactive && (
          <rect
            x="0"
            y="0"
            width="200"
            height="300"
            fill="black"
            opacity="0.3"
          />
        )}
      </svg>

      {/* Inactive Label */}
      {avatarData.inactive && showInactiveLabel && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold">
          INACTIVE
        </div>
      )}

      {/* Level Badge */}
      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
        {user.level}
      </div>
    </div>
  );
}

// Aura background layer
function AuraLayer({ color }: { color: string }) {
  return (
    <g opacity="0.3">
      <ellipse
        cx="100"
        cy="150"
        rx="90"
        ry="140"
        fill={color}
        filter="url(#glow)"
      />
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}

// Base body component with evolution
function BaseBody({ 
  skinColor, 
  bodyType, 
  gender,
  dominantSkill 
}: { 
  skinColor: string; 
  bodyType: BodyType;
  gender: string;
  dominantSkill: string;
}) {
  // Body width based on body type
  const bodyWidth = {
    slim: 35,
    average: 45,
    athletic: 50,
    plus: 60,
  }[bodyType];

  // Shoulder width adjustment for Physical dominance
  const shoulderMultiplier = dominantSkill === 'Physical' ? 1.2 : 1;
  
  return (
    <g>
      {/* Torso */}
      <rect
        x={100 - bodyWidth / 2}
        y="120"
        width={bodyWidth * shoulderMultiplier}
        height="120"
        rx="10"
        fill={skinColor}
        stroke="#000"
        strokeWidth="2"
      />
      
      {/* Arms */}
      <rect
        x={100 - bodyWidth / 2 - 15}
        y="130"
        width="12"
        height="90"
        rx="6"
        fill={skinColor}
        stroke="#000"
        strokeWidth="2"
      />
      <rect
        x={100 + bodyWidth / 2 + 3}
        y="130"
        width="12"
        height="90"
        rx="6"
        fill={skinColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Legs */}
      <rect
        x="75"
        y="240"
        width="18"
        height="55"
        rx="9"
        fill={skinColor}
        stroke="#000"
        strokeWidth="2"
      />
      <rect
        x="107"
        y="240"
        width="18"
        height="55"
        rx="9"
        fill={skinColor}
        stroke="#000"
        strokeWidth="2"
      />
    </g>
  );
}

// Head component with expressions
function Head({ 
  skinColor, 
  style, 
  expression 
}: { 
  skinColor: string; 
  style: string;
  expression: string;
}) {
  // Different hair styles based on style number
  const hairColor = ['#8B4513', '#FFD700', '#000000'][parseInt(style) - 1] || '#8B4513';

  return (
    <g>
      {/* Head */}
      <circle
        cx="100"
        cy="90"
        r="35"
        fill={skinColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Hair - changes based on style */}
      <ellipse
        cx="100"
        cy="70"
        rx="38"
        ry="25"
        fill={hairColor}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Eyes - change based on expression */}
      {expression === 'intense' ? (
        <>
          <rect x="85" y="85" width="8" height="4" rx="2" fill="#000" />
          <rect x="107" y="85" width="8" height="4" rx="2" fill="#000" />
        </>
      ) : (
        <>
          <circle cx="88" cy="88" r="4" fill="#000" />
          <circle cx="112" cy="88" r="4" fill="#000" />
        </>
      )}

      {/* Mouth - changes based on expression */}
      {expression === 'charismatic' ? (
        <path
          d="M 90 105 Q 100 110 110 105"
          stroke="#000"
          strokeWidth="2"
          fill="none"
        />
      ) : (
        <line
          x1="92"
          y1="105"
          x2="108"
          y2="105"
          stroke="#000"
          strokeWidth="2"
        />
      )}
    </g>
  );
}

// Cosmetic layer component
function CosmeticLayer({ itemId }: { itemId: string }) {
  // Placeholder cosmetics - replace with actual art
  switch (itemId) {
    case 'newbie_sweatband':
      return (
        <rect
          x="70"
          y="75"
          width="60"
          height="8"
          rx="4"
          fill="#ff6b6b"
          stroke="#000"
          strokeWidth="1"
        />
      );
    
    case 'shadow_cloak':
      return (
        <path
          d="M 55 140 L 40 250 L 75 240 L 100 180 L 125 240 L 160 250 L 145 140 Z"
          fill="#2d3748"
          stroke="#000"
          strokeWidth="2"
          opacity="0.9"
        />
      );
    
    case 'arcane_goggles':
      return (
        <g>
          <ellipse cx="88" cy="88" rx="12" ry="10" fill="#4299e1" stroke="#000" strokeWidth="2" opacity="0.6" />
          <ellipse cx="112" cy="88" rx="12" ry="10" fill="#4299e1" stroke="#000" strokeWidth="2" opacity="0.6" />
          <line x1="100" y1="88" x2="100" y2="88" stroke="#000" strokeWidth="2" />
        </g>
      );
    
    case 'champion_pauldrons':
      return (
        <g>
          <path
            d="M 40 130 L 50 145 L 60 140 L 55 125 Z"
            fill="#ffd700"
            stroke="#000"
            strokeWidth="2"
          />
          <path
            d="M 160 130 L 150 145 L 140 140 L 145 125 Z"
            fill="#ffd700"
            stroke="#000"
            strokeWidth="2"
          />
        </g>
      );
    
    case 'momentum_aura':
      return (
        <g opacity="0.5">
          <circle cx="100" cy="150" r="95" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10,5" />
        </g>
      );
    
    default:
      return null;
  }
}
