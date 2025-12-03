
'use client';

import { useEffect, useRef, useState } from 'react';

interface ReadyPlayerMeProps {
  onAvatarCreated: (avatarUrl: string) => void;
  onCancel?: () => void;
  subdomain?: string; // Your custom subdomain (optional)
  className?: string;
}

/**
 * Ready Player Me Avatar Creator
 * Embeds the RPM avatar creator and returns the avatar URL when complete
 */
export function ReadyPlayerMeCreator({
  onAvatarCreated,
  onCancel,
  subdomain = 'demo', // Use 'demo' for testing, replace with your subdomain later
  className = '',
}: ReadyPlayerMeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        // Only accept messages from Ready Player Me
        if (!event.origin.includes('readyplayer.me')) return;

        const data = JSON.parse(event.data);

        // Avatar export completed - this is what we want!
        if (data.eventName === 'v1.avatar.exported') {
          const avatarUrl = data.data.url; // Full 3D model URL
          // The creator returns a .glb model, but we want a .png portrait for display
          const imageUrl = avatarUrl.replace('.glb', '.png') + '?scene=fullbody-portrait-v1';
          onAvatarCreated(imageUrl);
        }

        // Frame is ready to use
        if (data.eventName === 'v1.frame.ready') {
          setIsLoading(false);
          // Optional: send config to the creator
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              target: 'readyplayerme',
              type: 'subscribe',
              eventName: 'v1.**',
            }),
            '*'
          );
        }

        // User cancelled
        if (data.eventName === 'v1.user.cancelled' && onCancel) {
          onCancel();
        }
        
      } catch (error) {
        // This can happen if the message is not JSON, we can ignore it.
      }
    };
    
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onAvatarCreated, onCancel]);

  // Build the iframe URL with configuration
  const iframeUrl = `https://${subdomain}.readyplayer.me/avatar?frameApi&clearCache&bodyType=fullbody`;

  return (
    <div className={`relative w-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading avatar creator...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className="w-full h-full border-0 rounded-lg"
        allow="camera *; microphone *"
        title="Ready Player Me Avatar Creator"
      />
    </div>
  );
}

/**
 * Display a Ready Player Me avatar image
 */
interface AvatarDisplayProps {
  avatarUrl: string;
  size?: number;
  scene?: 'fullbody-portrait-v1' | 'halfbody-portrait-v1' | 'bust-portrait-v1';
  className?: string;
}

export function ReadyPlayerMeAvatar({
  avatarUrl,
  size = 300,
  scene = 'fullbody-portrait-v1',
  className = '',
}: AvatarDisplayProps) {
  // Convert GLB model URL to PNG image URL
  const imageUrl = avatarUrl.includes('.png')
    ? avatarUrl
    : `${avatarUrl.replace('.glb', '.png')}?scene=${scene}`;

  return (
    <img
      src={imageUrl}
      alt="Avatar"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
