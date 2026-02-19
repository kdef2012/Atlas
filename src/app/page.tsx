
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Footer } from '@/components/common/Footer';

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/onboarding/archetype');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="text-center z-10"
        >
          <h1 className="font-headline text-2xl md:text-4xl font-bold mb-4" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
            Your life has been waiting for a player.
          </h1>
          <p className="mb-10 text-lg text-muted-foreground" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              A new world awaits.
          </p>
          <motion.button
            onClick={handleStart}
            className="font-headline text-xl bg-transparent border border-foreground rounded-md px-8 py-3 text-foreground transition-all duration-300 hover:bg-foreground hover:text-background focus:outline-none focus:ring-2 focus:ring-foreground"
            style={{ fontFamily: '"Courier New", Courier, monospace', animation: 'pulse-glow 2s infinite ease-in-out' }}
          >
            [PRESS START]
          </motion.button>
          <div className="absolute bottom-4 right-4">
              <Link href="/login">
                  <Shield className="w-6 h-6 text-muted-foreground/20 hover:text-muted-foreground transition-colors" />
              </Link>
          </div>
        </motion.div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 z-0 opacity-5" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px transparent;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 15px hsl(var(--primary) / 0.7);
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
}
