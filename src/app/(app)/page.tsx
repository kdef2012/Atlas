

'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page has been moved to /dashboard to resolve a routing conflict.
// This file can now be safely deleted or kept as a redirect.
export default function OldDashboardPage() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);

  return null;
}
