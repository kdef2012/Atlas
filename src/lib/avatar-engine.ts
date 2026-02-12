import React from 'react';

// Builds the RPM URL with active static assets appended
export function buildRpmUrl(baseUrl: string, activeAssetIds: string[]): string {
  if (!baseUrl) return '';
  const url = new URL(baseUrl.replace('.glb', '.png')); // Force PNG for 2D UI
  url.searchParams.set('scene', 'fullbody-portrait-v1-transparent');
  if (activeAssetIds.length > 0) {
    url.searchParams.set('assets', activeAssetIds.join(','));
  }
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
