"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white">
      <div className="text-center animate-fade-in">
        <h1 className="font-headline text-4xl md:text-6xl font-bold mb-8">Your life is waiting.</h1>
        <Button asChild size="lg" className="w-full max-w-xs font-bold group bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/onboarding/archetype">
            Begin
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 3s ease-in forwards;
        }
      `}</style>
    </main>
  );
}
