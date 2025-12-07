'use client';
import type { ReactNode } from "react";
import { useEffect } from "react";
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

  // FIX: These hooks are now called unconditionally to satisfy the Rules of Hooks.
  // useMemoFirebase is designed to return null if authUser is null, which useDoc handles gracefully.
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData } = useDoc(adminRef);

  // Handle redirects ONLY when all auth/data checks are complete
  useEffect(() => {
    // Wait until the initial auth check AND the user document load are complete
    if (isAuthLoading || (authUser && isUserDocLoading)) {
      return;
    }
    
    // If not authenticated, redirect to login (unless already there or on a public page)
    if (!authUser && !pathname.startsWith('/login') && !pathname.startsWith('/logout')) {
      redirect('/login');
      return;
    }

    // If authenticated...
    if (authUser) {
        // ...but has no user document, they need to go through onboarding.
        // We explicitly allow them to access /admin routes in case they are an admin without a user profile.
        if (!user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
            redirect('/onboarding/archetype');
        }
        // ...and they have a user document but land on an onboarding page, send them to the dashboard.
        else if (user && pathname.startsWith('/onboarding')) {
            redirect('/dashboard');
        }
    }

  }, [authUser, isAuthLoading, user, isUserDocLoading, pathname]);

  
  // Show a loading state while waiting for the initial auth status or user document.
  // This prevents layout shifts and rendering protected content prematurely.
  if (isAuthLoading || (authUser && isUserDocLoading && !user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin'))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }
  
  // If not loading and not authenticated, we will be redirected by the effect,
  // but we can return null to prevent rendering the layout for a split second.
  if (!authUser) {
    return null;
  }

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
