'use client';

import { useEffect, useRef, useState } from 'react';

interface UnionAvatarsProps {
  onAvatarCreated: (avatarUrl: string, previewUrl?: string) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Union Avatars Creator
 * Embeds the Union Avatars web creator and handles the export events.
 */
export function UnionAvatarsCreator({
  onAvatarCreated,
  onCancel,
  className = '',
}: UnionAvatarsProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dedicated iframe integration URL for Union Avatars
  const unionUrl = 'https://creator.unionavatars.com/';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: Only accept messages from Union Avatars domains
      if (!event.origin.includes('unionavatars.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Union Avatars common event structure for exports
        if (data.event === 'avatar-created' || data.action === 'avatar-exported' || data.type === 'avatar-created') {
          const glbUrl = data.url || data.glb || data.data?.url;
          const previewUrl = data.preview || data.image || data.data?.preview;
          onAvatarCreated(glbUrl, previewUrl);
        }
        
        // Handle iframe readiness
        if (data.event === 'ready' || data.action === 'ready') {
          setIsLoading(false);
        }

      } catch (error) {
        // Silent catch for non-JSON or malformed messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarCreated]);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-black/5 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 font-headline text-lg font-bold">Initializing Union Avatars...</p>
          <p className="text-sm text-muted-foreground">The portal is opening.</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={unionUrl}
        className="h-full w-full border-0"
        allow="camera *; microphone *"
        title="Union Avatars Creator"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

/**
 * Robust display component for Union Avatars (2D Renders)
 */
export function UnionAvatarDisplay({
  url,
  size = 300,
  className = '',
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  if (!url) return null;

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={url}
        alt="User Twinskie"
        className="h-full w-full object-contain transition-opacity duration-500"
        loading="lazy"
      />
    </div>
  );
}
