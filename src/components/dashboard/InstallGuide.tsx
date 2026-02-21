
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallGuide() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile browsers and if not already installed (standalone mode)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isMobile && !isStandalone) {
      // Small delay to ensure the user isn't overwhelmed immediately on load
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mb-6"
      >
        <Card className="border-accent/50 bg-accent/5 relative overflow-hidden">
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20 text-accent">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Install ATLAS Nebula</h3>
              <p className="text-xs text-muted-foreground leading-tight">
                {isAndroid 
                  ? "Tap the three dots (⋮) and select 'Install App' for the full native experience."
                  : "Tap Share and select 'Add to Home Screen' to unlock the full interface."}
              </p>
            </div>
            <div className="flex gap-2">
               {isAndroid ? <Download className="w-4 h-4 text-accent opacity-50" /> : <Share className="w-4 h-4 text-accent opacity-50" />}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
