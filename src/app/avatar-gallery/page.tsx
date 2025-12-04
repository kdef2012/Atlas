
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page has been removed as it was a developer-only tool.
// Redirect users to the main dashboard.
export default function AvatarGalleryPage() {
  useEffect(() => {
    redirect('/');
  }, []);

  return null;
}
