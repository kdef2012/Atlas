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

  // Combined loading state
  const isLoading = isAuthLoading || (!!authUser && isUserDocLoading);

  // 🔍 DEBUG - Remove after fixing
  useEffect(() => {
    if (authUser) {
      console.log('🔍 AppLayout Debug:', {
        timestamp: new Date().toISOString(),
        authEmail: authUser.email,
        authUID: authUser.uid,
        isAuthLoading,
        isUserDocLoading,
        combinedLoading: isLoading,
        userDocLoaded: !!user,
        userDocError: userDocError?.message,
        pathname,
        decision: (() => {
          if (authUser.email === 'kdef2012@gmail.com') return 'ADMIN HOT-PATH';
          if (isLoading) return 'LOADING';
          if (!user && !pathname.startsWith('/onboarding')) return 'REDIRECT TO ONBOARDING';
          if (user && pathname.startsWith('/onboarding')) return 'REDIRECT TO DASHBOARD';
          return 'RENDER APP';
        })()
      });
      
      // 🚨 CRITICAL ERROR LOGGING
      if (!isLoading && !user && userDocError) {
        console.error('❌ FIRESTORE ERROR:', {
          error: userDocError,
          message: userDocError.message,
          code: (userDocError as any).code,
          details: 'User document failed to load. This is likely a Firestore rules issue!',
          expectedPath: `/users/${authUser.uid}`,
          solution: 'Check if Firestore rules are published in Firebase Console'
        });
      }
    }
  }, [authUser, user, isAuthLoading, isUserDocLoading, isLoading, pathname, userDocError]);

  // 1. LOADING GATE - Wait for all data to settle
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

  // 2. UNAUTHENTICATED GATE - No auth user means go to login
  if (!authUser) {
    return redirect('/login');
  }

  // 3. ADMIN GATE - Special handling for admin
  if (authUser.email === 'kdef2012@gmail.com') {
    console.log('✅ Admin user detected:', authUser.email);
    if (!pathname.startsWith('/admin')) {
      console.log('🔄 Redirecting admin to /admin');
      return redirect('/admin');
    }
    // Admin is on admin route, proceed to render
  } 
  // 4. NEW USER GATE - User has no Firestore document
  else if (!user && !pathname.startsWith('/onboarding')) {
    console.log('🆕 New user detected, redirecting to onboarding');
    console.log('   Reason: user document is null');
    console.log('   Error:', userDocError?.message || 'No error');
    return redirect('/onboarding/archetype');
  } 
  // 5. EXISTING USER GATE - User has document but is on onboarding
  else if (user && pathname.startsWith('/onboarding')) {
    console.log('✅ Existing user on onboarding page, redirecting to dashboard');
    return redirect('/dashboard');
  }

  console.log('✅ Rendering app layout');

  // 6. RENDER APP LAYOUT
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
