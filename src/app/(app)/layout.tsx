
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
import { redirect, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const isLoading = isAuthLoading || isUserDocLoading;

  useEffect(() => {
    // If loading is finished, we have an authenticated user, but no user document in Firestore,
    // it means they are a new user who needs to go through onboarding.
    if (!isLoading && authUser && !user) {
      router.push('/onboarding/archetype');
    }
  }, [isLoading, authUser, user, router]);


  // If auth has loaded but there's no authenticated user, send to login.
  // This handles cases where someone tries to access the app directly without logging in.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // Show a loading skeleton while we're verifying auth and fetching the user document.
  // The useEffect above will handle redirection for new users once loading is complete.
  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">
      <Skeleton className="h-16 w-16 rounded-full" />
    </div>
  }
  
  // If we are still here after loading and the user object is still missing,
  // it means the useEffect is about to trigger the redirect. Render null to avoid a flash of content.
  if (!user) {
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
