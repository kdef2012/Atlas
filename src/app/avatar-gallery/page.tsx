'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page has been moved to /admin/avatar-gallery.
// This file can now be safely deleted or kept as a redirect.
export default function AvatarGalleryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/avatar-gallery');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to avatar gallery...</p>
    </div>
  );
}