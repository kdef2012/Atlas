
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

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading, error: userDocError } = useDoc<User>(userRef);

  const isAdminLogin = authUser?.email === 'kdef2012@gmail.com';

  const adminRef = useMemoFirebase(() => {
    // Only check for admin document if it's the specific admin user
    if (authUser && isAdminLogin) {
      return doc(firestore, 'admins', authUser.uid);
    }
    return null;
  }, [firestore, authUser, isAdminLogin]);

  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  // Track if loading has ever started (to distinguish initial false from completed false)
  const hasUserDocLoadingStarted = useRef(false);
  const hasAdminDocLoadingStarted = useRef(false);
  
  // ✅ NEW: Track previous auth state to detect logout
  const prevAuthUser = useRef(authUser);

  // Track when loading starts
  useEffect(() => {
    if (isUserDocLoading) {
      hasUserDocLoadingStarted.current = true;
    }
    if (isAdminDocLoading) {
      hasAdminDocLoadingStarted.current = true;
    }
  }, [isUserDocLoading, isAdminDocLoading]);

  // Calculate if we're truly ready (loading started AND finished)
  const isUserDocReady = authUser ? (hasUserDocLoadingStarted.current && !isUserDocLoading) : true;
  const isAdminDocReady = authUser && isAdminLogin ? (hasAdminDocLoadingStarted.current && !isAdminDocLoading) : true;
  const isReadyToDecide = !isAuthLoading && isUserDocReady && isAdminDocReady;

  // Handle redirects ONLY when fully ready
  useEffect(() => {
    if (!isReadyToDecide || !authUser) {
      return; // Wait until we're truly ready
    }

    if (isAdminLogin) {
      // Create admin document if needed
      if (!adminData) {
        const adminCollection = collection(firestore, 'admins');
        const newAdminDocRef = doc(adminCollection, authUser.uid);
        setDocumentNonBlocking(newAdminDocRef, {
          id: authUser.uid,
          email: authUser.email,
          userName: 'SuperAdmin',
          createdAt: Date.now(),
        }, {});
      }
    } else {
      // Regular user logic
      if (!user && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
        router.replace('/onboarding/archetype');
      } else if (user && pathname.startsWith('/onboarding')) {
        router.replace('/dashboard');
      }
    }
  }, [
    isReadyToDecide,
    authUser,
    user,
    adminData,
    isAdminLogin,
    router,
    pathname,
    firestore
  ]);

  // ✅ NOW we can do conditional returns AFTER all hooks are called
  
  // ✅ CRITICAL FIX: Detect if user just logged out
  // If we had a user and now we don't, we're logging out - don't redirect immediately
  const justLoggedOut = prevAuthUser.current && !authUser;
  
  // Update the ref for next render
  useEffect(() => {
    prevAuthUser.current = authUser;
  }, [authUser]);
  
  // Redirect to login if not authenticated
  // BUT: Don't redirect if we just logged out (let the logout flow complete)
  if (!isAuthLoading && !authUser && !justLoggedOut && !pathname.startsWith('/logout') && !pathname.startsWith('/login')) {
    return redirect('/login');
  }

  // Show loading while waiting for data
  const isLoading = isAuthLoading || !isReadyToDecide;
  
  // Don't show skeleton for onboarding or admin routes as they have their own loaders
  const shouldShowSkeleton = !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin');

  if (isLoading && shouldShowSkeleton) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
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
