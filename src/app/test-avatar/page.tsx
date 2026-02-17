'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This was a temporary test page and has been removed.
export default function TestAvatarPage() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);

  return null;
}
