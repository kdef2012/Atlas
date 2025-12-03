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
      viewBox="0 0 200 300"
      width={size}
      height={size}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Render in correct order: back to front */}
      
      {/* 1. Body (lowest layer) */}
      <Body pose={config.body} skinColor={skinColor} />
      
      {/* 2. Hair (back of head) */}
      <Hair style={config.hair} color={hairColor} />
      
      {/* 3. Head (on top of hair back) */}
      <Head shape={config.head} skinColor={skinColor} />
      
      {/* 4. Face features */}
      <Eyebrows style={config.eyebrows} />
      <Eyes style={config.eyes} />
      <Mouth style={config.mouth} />
      
      {/* 5. Facial Hair (if male) */}
      {config.gender === 'Male' && config.facialHair && config.facialHair !== 'none' && (
        <FacialHair style={config.facialHair} color={hairColor} />
      )}
      
      {/* 6. Hair (front strands) */}
      <HairFront style={config.hair} color={hairColor} />

      {/* 7. Accessories (topmost layer) */}
      {config.accessories?.map((accessory, i) => (
        <Accessory key={i} type={accessory} />
      ))}
    </svg>
  );
}

// SVG Body components (improved proportions and positioning)
function Body({ pose, skinColor }: { pose: string; skinColor: string }) {
  const bodyY = 150; // Start body position
  
  if (pose === 'sitting') {
    return (
      <g>
        {/* Torso */}
        <rect x="75" y={bodyY} width="50" height="70" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
        {/* Arms */}
        <rect x="55" y={bodyY + 10} width="15" height="50" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="130" y={bodyY + 10} width="15" height="50" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
        {/* Legs (bent) */}
        <rect x="80" y={bodyY + 70} width="15" height="45" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="105" y={bodyY + 70} width="15" height="45" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      </g>
    );
  }
  
  if (pose === 'arms-crossed') {
    return (
      <g>
        {/* Torso */}
        <rect x="70" y={bodyY} width="60" height="80" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
        {/* Arms crossed */}
        <path d={`M 70 ${bodyY + 30} L 50 ${bodyY + 25} L 50 ${bodyY + 50} L 70 ${bodyY + 45}`} fill={skinColor} stroke="#000" strokeWidth="2" />
        <path d={`M 130 ${bodyY + 30} L 150 ${bodyY + 25} L 150 ${bodyY + 50} L 130 ${bodyY + 45}`} fill={skinColor} stroke="#000" strokeWidth="2" />
        {/* Legs */}
        <rect x="80" y={bodyY + 80} width="15" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="105" y={bodyY + 80} width="15" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (pose === 'hands-in-pockets') {
    return (
      <g>
        {/* Torso */}
        <rect x="75" y={bodyY} width="50" height="80" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
        {/* Arms down */}
        <rect x="60" y={bodyY + 10} width="12" height="55" rx="6" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="128" y={bodyY + 10} width="12" height="55" rx="6" fill={skinColor} stroke="#000" strokeWidth="2" />
        {/* Legs */}
        <rect x="83" y={bodyY + 80} width="14" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
        <rect x="103" y={bodyY + 80} width="14" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  // Default standing pose
  return (
    <g>
      {/* Torso */}
      <rect x="75" y={bodyY} width="50" height="80" rx="10" fill={skinColor} stroke="#000" strokeWidth="2" />
      {/* Arms */}
      <rect x="58" y={bodyY + 10} width="14" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      <rect x="128" y={bodyY + 10} width="14" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      {/* Legs */}
      <rect x="83" y={bodyY + 80} width="14" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
      <rect x="103" y={bodyY + 80} width="14" height="60" rx="7" fill={skinColor} stroke="#000" strokeWidth="2" />
    </g>
  );
}

function Head({ shape, skinColor }: { shape: string; skinColor: string }) {
  const headY = 90;
  const headCenterX = 100;
  
  return (
    <ellipse 
      cx={headCenterX} 
      cy={headY} 
      rx="35" 
      ry="40" 
      fill={skinColor} 
      stroke="#000" 
      strokeWidth="2" 
    />
  );
}

function Hair({ style, color }: { style: string; color: string }) {
  const headY = 90;
  const headCenterX = 100;
  
  if (style === 'none') return null;

  if (style === 'bun') {
    return (
      <g>
        {/* Hair base covering top/back of head */}
        <ellipse cx={headCenterX} cy={headY - 15} rx="38" ry="25" fill={color} stroke="#000" strokeWidth="2" />
        {/* Bun on top */}
        <circle cx={headCenterX} cy={headY - 35} r="18" fill={color} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (style === 'afro') {
    return (
      <ellipse cx={headCenterX} cy={headY - 5} rx="50" ry="55" fill={color} stroke="#000" strokeWidth="2" />
    );
  }

  if (style === 'long1' || style === 'long2') {
    return (
      <g>
        {/* Top of head */}
        <ellipse cx={headCenterX} cy={headY - 15} rx="38" ry="25" fill={color} stroke="#000" strokeWidth="2" />
        {/* Long hair sides */}
        <rect x="60" y={headY} width="80" height="80" rx="15" fill={color} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (style === 'curly') {
    return (
      <g>
        <ellipse cx={headCenterX} cy={headY - 10} rx="40" ry="30" fill={color} stroke="#000" strokeWidth="2" />
        {/* Curly texture */}
        <circle cx="75" cy={headY - 10} r="8" fill={color} stroke="#000" strokeWidth="1" />
        <circle cx="125" cy={headY - 10} r="8" fill={color} stroke="#000" strokeWidth="1" />
        <circle cx="90" cy={headY - 20} r="8" fill={color} stroke="#000" strokeWidth="1" />
        <circle cx="110" cy={headY - 20} r="8" fill={color} stroke="#000" strokeWidth="1" />
      </g>
    );
  }

  if (style === 'dreads') {
    return (
      <g>
        <ellipse cx={headCenterX} cy={headY - 15} rx="38" ry="20" fill={color} stroke="#000" strokeWidth="2" />
        {/* Dreads */}
        {[75, 85, 95, 105, 115, 125].map((x, i) => (
          <rect key={i} x={x} y={headY + 10} width="6" height="40" rx="3" fill={color} stroke="#000" strokeWidth="1" />
        ))}
      </g>
    );
  }

  // Short hair styles (short1, short2, short3)
  return (
    <ellipse cx={headCenterX} cy={headY - 12} rx="38" ry="22" fill={color} stroke="#000" strokeWidth="2" />
  );
}

// Front hair strands (rendered on top of face)
function HairFront({ style, color }: { style: string; color: string }) {
  const headY = 90;
  const headCenterX = 100;
  
  // Only certain styles have front hair
  if (style === 'short2' || style === 'short3') {
    return (
      <g>
        {/* Front bangs */}
        <path 
          d={`M ${headCenterX - 25} ${headY - 20} Q ${headCenterX} ${headY - 10} ${headCenterX + 25} ${headY - 20}`}
          fill={color}
          stroke="#000"
          strokeWidth="2"
        />
      </g>
    );
  }
  
  return null;
}

function Eyes({ style }: { style: string }) {
  const headY = 90;
  const eyeY = headY + 5;
  
  if (style === 'happy') {
    return (
      <g>
        <path d={`M 85 ${eyeY} Q 90 ${eyeY + 5} 95 ${eyeY}`} stroke="#000" strokeWidth="2" fill="none" />
        <path d={`M 105 ${eyeY} Q 110 ${eyeY + 5} 115 ${eyeY}`} stroke="#000" strokeWidth="2" fill="none" />
      </g>
    );
  }

  if (style === 'hearts') {
    return (
      <g>
        <text x="85" y={eyeY + 8} fontSize="16">❤️</text>
        <text x="105" y={eyeY + 8} fontSize="16">❤️</text>
      </g>
    );
  }

  if (style === 'wink') {
    return (
      <g>
        <circle cx="88" cy={eyeY} r="4" fill="#000" />
        <path d={`M 105 ${eyeY} Q 110 ${eyeY + 3} 115 ${eyeY}`} stroke="#000" strokeWidth="2" fill="none" />
      </g>
    );
  }

  if (style === 'squint') {
    return (
      <g>
        <line x1="83" y1={eyeY} x2="93" y2={eyeY} stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <line x1="107" y1={eyeY} x2="117" y2={eyeY} stroke="#000" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }

  if (style === 'content') {
    return (
      <g>
        <path d={`M 83 ${eyeY - 2} Q 88 ${eyeY + 2} 93 ${eyeY - 2}`} stroke="#000" strokeWidth="2" fill="none" />
        <path d={`M 107 ${eyeY - 2} Q 112 ${eyeY + 2} 117 ${eyeY - 2}`} stroke="#000" strokeWidth="2" fill="none" />
      </g>
    );
  }

  // Normal eyes
  return (
    <g>
      <circle cx="88" cy={eyeY} r="4" fill="#000" />
      <circle cx="112" cy={eyeY} r="4" fill="#000" />
    </g>
  );
}

function Eyebrows({ style }: { style: string }) {
  const headY = 90;
  const browY = headY - 8;
  
  if (style === 'down') {
    return (
      <g>
        <path d={`M 80 ${browY + 2} L 95 ${browY - 2}`} stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <path d={`M 105 ${browY - 2} L 120 ${browY + 2}`} stroke="#000" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }

  if (style === 'leftLowered') {
    return (
      <g>
        <path d={`M 80 ${browY + 3} L 95 ${browY}`} stroke="#000" strokeWidth="2" strokeLinecap="round" />
        <path d={`M 105 ${browY - 2} L 120 ${browY - 2}`} stroke="#000" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  
  // Default "up" eyebrows
  return (
    <g>
      <path d={`M 80 ${browY} L 95 ${browY - 3}`} stroke="#000" strokeWidth="2" strokeLinecap="round" />
      <path d={`M 105 ${browY - 3} L 120 ${browY}`} stroke="#000" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Mouth({ style }: { style: string }) {
  const headY = 90;
  const mouthY = headY + 20;
  
  if (style === 'smile') {
    return <path d={`M 85 ${mouthY} Q 100 ${mouthY + 8} 115 ${mouthY}`} stroke="#000" strokeWidth="2" fill="none" />;
  }

  if (style === 'frown') {
    return <path d={`M 85 ${mouthY + 5} Q 100 ${mouthY} 115 ${mouthY + 5}`} stroke="#000" strokeWidth="2" fill="none" />;
  }

  if (style === 'surprised') {
    return <ellipse cx="100" cy={mouthY} rx="10" ry="12" fill="#fff" stroke="#000" strokeWidth="2" />;
  }

  if (style === 'smirk') {
    return <path d={`M 85 ${mouthY} Q 95 ${mouthY + 5} 115 ${mouthY}`} stroke="#000" strokeWidth="2" fill="none" />;
  }

  if (style === 'nervous') {
    return (
      <path 
        d={`M 85 ${mouthY} L 90 ${mouthY + 2} L 95 ${mouthY} L 100 ${mouthY + 2} L 105 ${mouthY} L 110 ${mouthY + 2} L 115 ${mouthY}`}
        stroke="#000" 
        strokeWidth="2" 
        fill="none" 
      />
    );
  }

  // Neutral line
  return <line x1="88" y1={mouthY} x2="112" y2={mouthY} stroke="#000" strokeWidth="2" strokeLinecap="round" />;
}

function FacialHair({ style, color }: { style: string; color: string }) {
  const headY = 90;
  const chinY = headY + 30;
  
  if (style === 'stubble') {
    return (
      <g opacity="0.5">
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = (i / 40) * Math.PI;
          const x = 100 + Math.cos(angle + Math.PI) * 30;
          const y = chinY + Math.sin(angle + Math.PI) * 15;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="0.8"
              fill={color}
            />
          );
        })}
      </g>
    );
  }

  if (style === 'mediumBeard') {
    return (
      <path
        d={`M 70 ${chinY - 10} Q 75 ${chinY + 10} 100 ${chinY + 15} Q 125 ${chinY + 10} 130 ${chinY - 10}`}
        fill={color}
        stroke="#000"
        strokeWidth="2"
      />
    );
  }

  if (style === 'goatee') {
    return (
      <ellipse
        cx="100"
        cy={chinY + 5}
        rx="12"
        ry="15"
        fill={color}
        stroke="#000"
        strokeWidth="2"
      />
    );
  }

  return null;
}

function Accessory({ type }: { type: string }) {
  const headY = 90;
  const eyeY = headY + 5;
  
  if (type === 'glasses') {
    return (
      <g>
        <circle cx="88" cy={eyeY} r="12" fill="none" stroke="#000" strokeWidth="2" />
        <circle cx="112" cy={eyeY} r="12" fill="none" stroke="#000" strokeWidth="2" />
        <line x1="100" y1={eyeY} x2="100" y2={eyeY} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (type === 'sunglasses') {
    return (
      <g>
        <ellipse cx="88" cy={eyeY} rx="12" ry="10" fill="#333" stroke="#000" strokeWidth="2" />
        <ellipse cx="112" cy={eyeY} rx="12" ry="10" fill="#333" stroke="#000" strokeWidth="2" />
        <line x1="100" y1={eyeY} x2="100" y2={eyeY} stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  if (type === 'hat') {
    return (
      <g>
        <rect x="65" y={headY - 60} width="70" height="12" rx="6" fill="#DC2626" stroke="#000" strokeWidth="2" />
        <rect x="75" y={headY - 80} width="50" height="25" rx="6" fill="#DC2626" stroke="#000" strokeWidth="2" />
      </g>
    );
  }

  return null;
}