
import React from 'react';

// Builds the RPM URL with active static assets appended
export function buildRpmUrl(baseUrl: string, activeAssetIds: string[]): string {
  // The 'activeAssetIds' parameter is no longer used for rendering, as we're using overlays.
  // This function now primarily ensures a transparent PNG is requested.
  if (!baseUrl) return '';
  
  // If it's already a data URI (from our AI flows), return it as is.
  if (baseUrl.startsWith('data:image')) {
    return baseUrl;
  }

  const url = new URL(baseUrl.replace('.glb', '.png')); // Force PNG for 2D UI
  url.searchParams.set('scene', 'fullbody-portrait-v1');
  url.searchParams.set('transparent', 'true'); // Correct parameter for transparency
  
  return url.toString();
}

// Global coordinate mapper to ensure SVGs stay pinned to the character
export function getLayerStyles(position: string): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', pointerEvents: 'none' };
  switch (position) {
    case 'head': return { ...base, top: '5%', left: '50%', transform: 'translateX(-50%)', width: '70%' };
    case 'face': return { ...base, top: '25%', left: '50%', transform: 'translateX(-50%)', width: '40%' };
    case 'body': return { ...base, top: '55%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%' };
    case 'aura': return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '130%', zIndex: 0 };
    case 'background': return { ...base, top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 };
    default: return base;
  }
}
