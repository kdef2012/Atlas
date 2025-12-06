
'use client';
import type { ReactNode } from "react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { redirect, usePathname, useRouter } from "next/navigation";
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
  // We are loading if auth is checking, OR if we have an auth user but are still waiting for their DB record.
  const isLoading = isAuthLoading || (!!authUser && isUserDocLoading);

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
  if (!authUser) {
    return redirect('/login');
  }

  // 3. Admin User Gate: Special handling for the admin user.
  // This check is simple and self-contained. It no longer interferes with regular user flow.
  if (authUser.email === 'kdef2012@gmail.com') {
      if (!pathname.startsWith('/admin')) {
          return redirect('/admin');
      }
      // If admin is on an admin route, proceed to render the layout.
  } else if (!user && !pathname.startsWith('/onboarding')) {
      // 4. New User Gate: A non-admin user is authenticated but has no user document. They must onboard.
      return redirect('/onboarding/archetype');
  } else if (user && pathname.startsWith('/onboarding')) {
      // 5. Existing User Gate: A non-admin, existing user landed on an onboarding page. Send them away.
      return redirect('/dashboard');
  }


  // 6. If all checks pass, render the full app layout for the authenticated user.
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
