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
  const { data: user, isLoading: isUserDocLoading, error: userDocError } = useDoc<User>(userRef);

  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  // Track if loading has ever started (to distinguish initial false from completed false)
  const hasUserDocLoadingStarted = useRef(false);
  const hasAdminDocLoadingStarted = useRef(false);

  const isAdminLogin = authUser?.email === 'kdef2012@gmail.com';

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

    console.log('🎯 Making routing decision:', {
      isAdminLogin,
      hasUser: !!user,
      hasAdmin: !!adminData,
      pathname,
    });

    if (isAdminLogin) {
      // Create admin document if needed
      if (!adminData) {
        console.log('🔧 Creating admin document for:', authUser.email);
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
        console.log('🔄 No user document - redirecting to onboarding');
        router.replace('/onboarding/archetype');
      } else if (user && pathname.startsWith('/onboarding')) {
        console.log('🔄 User exists - redirecting to dashboard');
        router.replace('/dashboard');
      } else if (user) {
        console.log('✅ User loaded successfully - rendering app');
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

  // Redirect to login if not authenticated
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // Show loading while waiting for data
  const isLoading = isAuthLoading || !isReadyToDecide;
  
  if (isLoading && !pathname.startsWith('/onboarding') && !pathname.startsWith('/admin')) {
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
