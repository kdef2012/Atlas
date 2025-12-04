
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page has been moved to /onboarding/claim-quest to fix an onboarding loop.
// This file can now be safely deleted or kept as a redirect.
export default function ClaimQuestPage() {
  useEffect(() => {
    redirect('/');
  }, []);

  return null;
}
