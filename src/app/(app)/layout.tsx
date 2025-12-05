
'use client';
import type { ReactNode } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { redirect, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  // The isLoading check is the most critical part. It now correctly waits for both
  // auth to be resolved AND the user document fetch to be attempted.
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  // 1. Strict Loading Gate: Render a loader and do nothing else until all data is settled.
  // This prevents any premature redirects.
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

  // 2. Unauthenticated Gate: If loading is finished and there's no authUser, they must log in.
  if (!authUser) {
    return redirect('/login');
  }
  
  // We check for admin status *after* the main loading is done.
  const isAdmin = authUser.email === 'kdef2012@gmail.com';
  
  // Special routing for admin users.
  if (isAdmin) {
    // If an admin is not in the admin section, redirect them there.
    if (!pathname.startsWith('/admin')) {
      return redirect('/admin');
    }
  } else {
    // 3. New User Gate: If it's not an admin, and the user doc doesn't exist, they need to onboard.
    // This now only runs AFTER isLoading is false, guaranteeing 'user' is truly null and not just loading.
    if (!user && !pathname.startsWith('/onboarding')) {
      return redirect('/onboarding/archetype');
    }
  
    // 4. Existing User Gate: If an existing user lands on onboarding, send them to the dashboard.
    if (user && pathname.startsWith('/onboarding')) {
      return redirect('/dashboard');
    }
  }
  
  // 5. If all checks pass, render the main app.
  return (
    <SidebarProvider>
      <Sidebar>
        <SideNav />
      </Sidebar>
      <SidebarInset>
        <AnnouncementBanner />
        <AppHeader />
        <main className="p-4 md:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
