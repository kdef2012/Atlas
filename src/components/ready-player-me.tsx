
'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from Ready Player Me
      if (!event.origin.includes('readyplayer.me')) return;

      const data = event.data;

      // Avatar export completed
      if (data.eventName === 'v1.avatar.exported') {
        const avatarUrl = data.data.url as string; // Full 3D model URL (.glb)
        
        console.log('Avatar GLB created:', avatarUrl);
        onAvatarCreated(avatarUrl);
      }

      // User cancelled
      if (data.eventName === 'v1.user.cancelled' && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onAvatarCreated, onCancel]);

  // Build the iframe URL with configuration
  const iframeUrl = `https://${subdomain}.readyplayer.me/avatar?frameApi&bodyType=fullbody&clearCache`;

  return (
    <div className={`relative w-full ${className}`}>
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
