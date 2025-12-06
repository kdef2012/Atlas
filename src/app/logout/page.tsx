'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { LogIn } from 'lucide-react';

export default function LogoutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="text-center z-10"
      >
        <div className="relative w-80 h-80 mx-auto mb-8">
            <Image
                src="https://picsum.photos/seed/atlasmap/800/800"
                alt="A map of the ATLAS world"
                fill
                className="object-cover rounded-full border-2 border-primary/30 shadow-2xl shadow-primary/20"
                data-ai-hint="futuristic world map"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full"></div>
        </div>

        <h1
          className="font-headline text-4xl md:text-5xl font-bold mb-4 text-primary"
          style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}
        >
          The ATLAS will be waiting
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          Your journey is saved. Return when you're ready to continue.
        </p>
        <Button asChild size="lg">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Sign Back In
          </Link>
        </Button>
      </motion.div>
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>
    </main>
  );
}
