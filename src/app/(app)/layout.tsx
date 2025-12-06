
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

  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  // 1. First, wait for auth and user data to be fully loaded.
  // This is the most critical gate to prevent premature redirects.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  // 2. After loading, if there's no authenticated user, redirect to login.
  // This is the primary protection for the app.
  if (!authUser) {
    redirect('/login');
    return null; // Return null after redirect
  }

  // 3. If there IS an auth user, but they don't have a user document in Firestore,
  // it means they are a new user who hasn't completed onboarding.
  // We should send them there, unless they are an admin trying to access the admin section.
  if (!user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
    redirect('/onboarding/archetype');
    return null;
  }
  
  // 4. If an existing user (with a user doc) somehow lands on the onboarding pages,
  // send them to the dashboard where they belong.
  if (user && pathname.startsWith('/onboarding')) {
      redirect('/dashboard');
      return null;
  }

  // 5. If all checks pass, the user is authenticated and has a valid user document.
  // Render the full application layout.
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
