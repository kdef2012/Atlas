"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Atom } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-white overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        {/* Animated background grid */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        <div className="flex justify-center items-center mb-6">
          <Atom className="w-16 h-16 text-primary animate-pulse" />
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent">
          ATLAS
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          A revolutionary application that gamifies human existence. Log your skills, complete quests, and become the person you were meant to be.
        </p>
        <Button asChild size="lg" className="w-full max-w-xs font-bold group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 transform hover:scale-105">
          <Link href="/onboarding/archetype">
            Begin Your Journey
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>
    </main>
  );
}
