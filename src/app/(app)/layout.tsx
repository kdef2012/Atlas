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

  // Hardcoded super-admin check for bootstrap
  const isAdminLogin = authUser?.email === 'kdef2012@gmail.com';

  const adminRef = useMemoFirebase(() => {
    if (authUser && isAdminLogin) {
      return doc(firestore, 'admins', authUser.uid);
    }
    return null;
  }, [firestore, authUser, isAdminLogin]);

  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  const hasUserDocLoadingStarted = useRef(false);
  const hasAdminDocLoadingStarted = useRef(false);

  useEffect(() => {
    if (isUserDocLoading) hasUserDocLoadingStarted.current = true;
    if (isAdminDocLoading) hasAdminDocLoadingStarted.current = true;
  }, [isUserDocLoading, isAdminDocLoading]);
  
  const isUserDocReady = authUser ? (hasUserDocLoadingStarted.current && !isUserDocLoading) : true;
  const isAdminDocReady = !isAdminLogin || (hasAdminDocLoadingStarted.current && !isAdminDocLoading);
  const isReadyToDecide = !isAuthLoading && isUserDocReady && isAdminDocReady;

  useEffect(() => {
    if (!isReadyToDecide || !authUser) return;

    if (isAdminLogin) {
      if (!adminData && !isAdminDocLoading) {
        const newAdminDocRef = doc(firestore, 'admins', authUser.uid);
        setDocumentNonBlocking(newAdminDocRef, {
          id: authUser.uid,
          email: authUser.email,
          userName: 'SuperAdmin',
          createdAt: Date.now(),
        }, {});
      }
    } else {
      const isOnboarding = pathname.startsWith('/onboarding');
      
      // If profile is totally missing, go to start of onboarding
      if (!user && !isOnboarding) {
        router.replace('/onboarding/archetype');
      } 
      // If profile exists but is incomplete (no avatarStyle), go to onboarding
      else if (user && !user.avatarStyle && !isOnboarding) {
        router.replace('/onboarding/archetype');
      }
      // If profile is complete but user is trying to go back to the START of onboarding, push to dashboard
      // We allow /welcome and /reward to finish normally.
      else if (user && user.avatarStyle && pathname === '/onboarding/archetype') {
        router.replace('/dashboard');
      }
    }
  }, [
    isReadyToDecide,
    authUser,
    user,
    adminData,
    isAdminLogin,
    isAdminDocLoading,
    router,
    pathname,
    firestore
  ]);
  
  if (!isAuthLoading && !authUser && !pathname.startsWith('/logout') && !pathname.startsWith('/login')) {
    return redirect('/login');
  }

  const isLoading = isAuthLoading || (authUser && !isReadyToDecide);
  const isActuallyOnboarding = pathname.startsWith('/onboarding');

  // While deciding or loading, show a skeleton unless we are already on an onboarding page
  if (isLoading && !isActuallyOnboarding && !pathname.startsWith('/admin')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
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
