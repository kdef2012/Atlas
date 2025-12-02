
"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/onboarding/archetype');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="text-center z-10"
      >
        <h1 className="font-headline text-2xl md:text-4xl font-bold mb-10" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
          Your life has been waiting for a player.
        </h1>
        <motion.button
          onClick={handleStart}
          className="font-headline text-xl bg-transparent border border-white rounded-md px-8 py-3 text-white transition-all duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          [PRESS START]
        </motion.button>
      </motion.div>
      <div className="absolute inset-0 z-0 opacity-5" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <audio autoPlay loop>
        <source src="https://firebasestorage.googleapis.com/v0/b/owl-about-that-9f67d.appspot.com/o/assets%2Fthrum.mp3?alt=media&token=2ab4f4df-a82b-4752-921c-91ede4f686c5" type="audio/mpeg" />
      </audio>
    </main>
  );
}
