
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ScrollText, Store, User as UserIcon, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { haptics } from '@/lib/haptics';

const mobileItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/quests', label: 'Quests', icon: ScrollText },
  { href: '/store', label: 'Store', icon: Store },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-background/80 backdrop-blur-lg border-t border-primary/10 h-16 pb-safe md:hidden">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => haptics.light()}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_hsl(var(--primary))]" />
            )}
          </Link>
        );
      })}
      
      {/* The "More" button triggers the existing Sidebar Sheet */}
      <div className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground relative">
        <SidebarTrigger className="absolute inset-0 w-full h-full opacity-0 z-10" onClick={() => haptics.light()} />
        <Menu className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
      </div>
    </nav>
  );
}
