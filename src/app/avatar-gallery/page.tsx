
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page has been moved to /admin/avatar-gallery.
// This file can now be safely deleted or kept as a redirect.
export default function AvatarGalleryRedirectPage() {
  useEffect(() => {
    redirect('/admin/avatar-gallery');
  }, []);

  return null;
}
