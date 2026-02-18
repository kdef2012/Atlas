'use client';

import { useEffect, useRef, useState } from 'react';

interface AvaturnProps {
  onAvatarCreated: (glbUrl: string, previewUrl: string) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Avaturn Avatar Creator
 * Embeds the Avaturn web creator and handles the export events.
 * Avaturn is a high-fidelity 3D avatar creator that works via iframe.
 */
export function AvaturnCreator({
  onAvatarCreated,
  onCancel,
  className = '',
}: AvaturnProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Using the stable Avaturn main portal URL for broader compatibility.
  const avaturnUrl = 'https://avaturn.me';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: Only accept messages from Avaturn domain
      if (!event.origin.includes('avaturn.me')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Avaturn uses a structured message system
        // source: "avaturn", type: "export", data: { url: "glb_url", preview: "image_url" }
        if (data.source === 'avaturn' && data.type === 'export') {
          const glbUrl = data.data.url;
          const previewUrl = data.data.preview;
          
          if (glbUrl && previewUrl) {
            onAvatarCreated(glbUrl, previewUrl);
          }
        }
        
        // Handle cancellation
        if (data.source === 'avaturn' && data.type === 'back' && onCancel) {
          onCancel();
        }

      } catch (error) {
        // Silent catch for non-JSON or malformed messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarCreated, onCancel]);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-black/5 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 font-headline text-lg font-bold">Connecting to Avaturn...</p>
          <p className="text-sm text-muted-foreground">Initializing 3D workspace.</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={avaturnUrl}
        className="h-full w-full border-0"
        allow="camera *; microphone *"
        title="Avaturn Avatar Creator"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
