
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Atom } from 'lucide-react';

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full py-12 px-4 border-t bg-card/30 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Atom className="w-6 h-6 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight">ATLAS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A revolutionary environment for the evolution of human potential.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-primary">The Core</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
            <li><Link href="/nebula" className="text-muted-foreground hover:text-primary transition-colors">The Nebula</Link></li>
            <li><Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">Global Apex</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-primary">Legalities</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Protocol</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-primary">Signal Status</h4>
          <div className="flex items-center gap-2 text-sm text-green-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Nebula Core Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 uppercase font-bold">
            &copy; {year || '...'} ATLAS INTERACTIVE. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
