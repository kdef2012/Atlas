
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Volume2 } from "lucide-react";

/**
 * AppHeader - Standardized Header for ATLAS
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="hidden lg:inline text-muted-foreground">Signal Strength: 100%</span>
        </div>
      </div>
    </header>
  );
}
