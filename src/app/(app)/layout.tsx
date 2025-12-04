
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
    // This is the main redirection logic for new users.
    if (!isLoading && authUser && !user) {
      // ** CRITICAL FIX **: Do NOT redirect the designated admin user to onboarding.
      // Let the AdminLayout handle their existence.
      if (authUser.email === 'kdef2012@gmail.com') {
        return;
      }

      // Do not redirect if they are already in onboarding or trying to access admin pages.
      if (!pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
        router.push('/onboarding/archetype');
      }
    }
  }, [isLoading, authUser, user, router, pathname]);


  // If auth has loaded but there's no authenticated user, send to login.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // While the initial user authentication or Firestore document is loading, show a skeleton.
  if (isLoading && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  // If an existing user tries to access onboarding, send them to the dashboard.
  if (user && pathname.startsWith('/onboarding')) {
    return redirect('/dashboard');
  }
  
  // The AdminLayout is a child of this layout and will handle its own UI and logic.
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
