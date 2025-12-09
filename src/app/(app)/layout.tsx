
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

  const isAdminLogin = authUser?.email === 'kdef2012@gmail.com';

  const adminRef = useMemoFirebase(() => {
    // Only check for admin doc if the email matches
    if (authUser && isAdminLogin) {
      return doc(firestore, 'admins', authUser.uid);
    }
    return null;
  }, [firestore, authUser, isAdminLogin]);

  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  const hasUserDocLoadingStarted = useRef(false);
  const hasAdminDocLoadingStarted = useRef(false);
  const prevAuthUser = useRef(authUser);

  useEffect(() => {
    if (isUserDocLoading) {
      hasUserDocLoadingStarted.current = true;
    }
    if (isAdminDocLoading) {
      hasAdminDocLoadingStarted.current = true;
    }
  }, [isUserDocLoading, isAdminDocLoading]);
  
  // The admin doc is only "ready" if it wasn't supposed to be loaded in the first place, OR if it has finished loading.
  const isAdminDocReady = !isAdminLogin || (hasAdminDocLoadingStarted.current && !isAdminDocLoading);
  const isUserDocReady = authUser ? (hasUserDocLoadingStarted.current && !isUserDocLoading) : true;
  const isReadyToDecide = !isAuthLoading && isUserDocReady && isAdminDocReady;

  useEffect(() => {
    if (!isReadyToDecide || !authUser) {
      return;
    }

    if (isAdminLogin) {
      if (!adminData) {
        const newAdminDocRef = doc(firestore, 'admins', authUser.uid);
        setDocumentNonBlocking(newAdminDocRef, {
          id: authUser.uid,
          email: authUser.email,
          userName: 'SuperAdmin',
          createdAt: Date.now(),
        }, {});
      }
    } else {
        if (!user && !pathname.startsWith('/onboarding')) {
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
  
  const justLoggedOut = prevAuthUser.current && !authUser;
  
  useEffect(() => {
    prevAuthUser.current = authUser;
  }, [authUser]);
  
  if (!isAuthLoading && !authUser && !justLoggedOut && !pathname.startsWith('/logout') && !pathname.startsWith('/login')) {
    return redirect('/login');
  }

  const isLoading = isAuthLoading || (authUser && !isAdminDocReady) || (authUser && !isUserDocReady && !pathname.startsWith('/onboarding'));
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
