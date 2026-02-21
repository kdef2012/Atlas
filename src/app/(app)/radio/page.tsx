
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * @fileOverview This page has been decommissioned to improve application stability.
 * Users are redirected to the dashboard.
 */
export default function RadioDecommissionedPage() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);

  return null;
}
