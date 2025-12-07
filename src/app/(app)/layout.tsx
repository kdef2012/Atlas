'use client';
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { redirect, useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  // Redirect to login if not authenticated and initial auth check is complete.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // Handle onboarding for new users.
  // This runs only after we know the user is logged in but their user doc is not yet created.
  if (!isAuthLoading && authUser && !isUserDocLoading && !user) {
    // Allow access to onboarding routes
    if (!pathname.startsWith('/onboarding')) {
      return redirect('/onboarding/archetype');
    }
  }
  
  // Handle existing users who land on onboarding pages.
  if (user && pathname.startsWith('/onboarding')) {
      redirect('/dashboard');
  }
  
  // While loading auth status or the user document, show a loader.
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  if (isLoading) {
    // Avoid showing the main app layout skeleton on onboarding pages.
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/admin')) {
      return (
         <div className="flex h-screen w-screen items-center justify-center">
            <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      )
    }
    // Show a more detailed skeleton for the main app layout.
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
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
