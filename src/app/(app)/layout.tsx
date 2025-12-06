
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

  // 1. Wait for auth to finish loading. If not logged in, redirect to login.
  // This is the first gate.
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  if (!authUser) {
    return redirect('/login');
  }

  // 2. Auth user exists. Now, check for the user's data document in Firestore.
  // This is the second gate. Show a loader while we check the database.
  if (isUserDocLoading) {
    // Avoid showing the loader for admin pages, as they have their own auth layout.
    if (!pathname.startsWith('/admin')) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      );
    }
  }

  // 3. We have a definitive answer about the user document.
  // If it doesn't exist, and they aren't already in onboarding or admin, send them there.
  if (!user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
    redirect('/onboarding/archetype');
    return null; // Return null after redirect
  }
  
  // If they are an existing user but somehow land on onboarding, send them away.
  if (user && pathname.startsWith('/onboarding')) {
      redirect('/dashboard');
      return null;
  }

  // 4. If all checks pass, render the main application layout.
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
