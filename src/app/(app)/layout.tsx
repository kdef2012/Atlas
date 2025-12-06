
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
import { useEffect } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading, error: userDocError } = useDoc<User>(userRef);

  // This is the CRITICAL change. isLoading is true if auth is loading,
  // OR if we have an authUser but are still waiting for their Firestore doc.
  const isLoading = isAuthLoading || (!!authUser && isUserDocLoading);

  // 1. LOADING GATE: Wait for all data to settle before doing anything else.
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

  // 2. UNAUTHENTICATED GATE: No auth user means go to login.
  if (!authUser) {
    return redirect('/login');
  }
  
  // 3. ADMIN GATE: Special handling for admin.
  // This check is simple and happens after all loading is complete.
  if (authUser.email === 'kdef2012@gmail.com') {
    if (!pathname.startsWith('/admin')) {
      return redirect('/admin');
    }
  }
  // 4. REGULAR USER ROUTING (mutually exclusive with admin)
  else {
      // NEW USER GATE: User has no Firestore document, they must onboard.
      if (!user && !pathname.startsWith('/onboarding')) {
        return redirect('/onboarding/archetype');
      } 
      // EXISTING USER GATE: User has a document but is on an onboarding page.
      else if (user && pathname.startsWith('/onboarding')) {
        return redirect('/dashboard');
      }
  }


  // 5. RENDER APP: If all checks pass, render the main app layout.
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
