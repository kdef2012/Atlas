
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
import { redirect, useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  useEffect(() => {
    // If loading is finished, we have an authenticated user, but no user document in Firestore,
    // it means they are a new user who needs to go through onboarding.
    if (!isLoading && authUser && !user) {
      if (!pathname.startsWith('/onboarding')) {
        router.push('/onboarding/archetype');
      }
    }
  }, [isLoading, authUser, user, router, pathname]);


  // If auth has loaded but there's no authenticated user, send to login.
  // This handles cases where someone tries to access the app directly without logging in.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // If we are still loading, or if we have an authUser but no user doc yet (and are about to redirect),
  // show a full-page skeleton. This prevents a flash of the old layout.
  if (isLoading && !pathname.startsWith('/onboarding')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  // If an existing user tries to access onboarding, redirect them to the dashboard.
  if (user && pathname.startsWith('/onboarding')) {
    return redirect('/dashboard');
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
