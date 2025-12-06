
'use client';
import type { ReactNode } from "react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { redirect, usePathname } from "next/navigation";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  // A single, reliable loading state.
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  // 1. Strict Loading Gate: Render a loader and do nothing else until all data is settled.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading ATLAS...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Gate: If loading is done and there's no authUser, they must log in.
  // Exception for the root landing page, which is public.
  if (!authUser) {
    if (pathname !== '/') {
        return redirect('/login');
    }
    // Allow landing page for unauth users.
    return <>{children}</>;
  }
  
  const isAdmin = authUser.email === 'kdef2012@gmail.com';

  // 3. New User Gate: If they are authenticated but have no user document, they must onboard.
  if (!isAdmin && !user && !pathname.startsWith('/onboarding')) {
    return redirect('/onboarding/archetype');
  }

  // 4. Existing User Gate: If an existing user lands on onboarding, send them away.
  if (!isAdmin && user && pathname.startsWith('/onboarding')) {
    return redirect('/dashboard');
  }

  // 5. Admin Routing Gate
  if (isAdmin && !pathname.startsWith('/admin')) {
      return redirect('/admin');
  }

  // If all checks pass, render the full app layout.
  return (
    <SidebarProvider>
      <Sidebar>
        <SideNav />
      </Sidebar>
      <SidebarInset>
        <AnnouncementBanner />
        <AppHeader />
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
