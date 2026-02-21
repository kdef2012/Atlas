
'use client';
import type { ReactNode } from "react";
import { useEffect, Suspense } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import { Footer } from "@/components/common/Footer";
import { MobileNav } from "@/components/common/MobileNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { redirect, useRouter, usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User, UserSettings } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import { cn } from "@/lib/utils";

/**
 * Handles payment and onboarding redirect logic that requires useSearchParams.
 */
function NavigationGuard({ children, user, isAdmin, isLoading }: { children: ReactNode, user: User | null, isAdmin: boolean, isLoading: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return;

    const isPaywallPage = pathname === '/paywall';
    const isOnboardingPage = pathname.startsWith('/onboarding');
    const isLegalPage = pathname.startsWith('/legal');
    
    if (isAdmin || isLegalPage) return;

    const isReturningFromCheckout = searchParams.get('status') === 'success' || searchParams.get('status') === 'activated';

    if (user && user.hasPaidAccess === false) {
      if (!isPaywallPage && !isReturningFromCheckout) {
        router.replace('/paywall');
      }
      return;
    }

    if (isPaywallPage && user?.hasPaidAccess) {
      router.replace('/dashboard');
      return;
    }

    if (!user) {
      if (!isOnboardingPage && !isPaywallPage) {
        router.replace('/onboarding/archetype');
      }
    } else {
      const hasArchetype = !!user?.archetype;
      const hasAvatar = !!(user?.avatarUrl || user?.avatarStyle);
      const isProfileComplete = hasArchetype && hasAvatar;

      if (!hasArchetype && !isPaywallPage) {
        if (pathname !== '/onboarding/archetype') {
          router.replace('/onboarding/archetype');
        }
      } else if (hasArchetype && !hasAvatar && !isPaywallPage) {
        if (!isOnboardingPage) {
          router.replace(`/onboarding/customize?archetype=${user.archetype}`);
        }
      } else if (isProfileComplete) {
        if (pathname === '/onboarding/archetype') {
          router.replace('/dashboard');
        }
      }
    }
  }, [isLoading, user, isAdmin, pathname, searchParams, router]);

  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  const settingsRef = useMemoFirebase(() => authUser ? doc(firestore, `users/${authUser.uid}/settings/main`) : null, [firestore, authUser]);
  const { data: settings } = useDoc<UserSettings>(settingsRef);

  const isSuperAdminEmail = authUser?.email === 'kdef2012@gmail.com';
  const isLoading = isAuthLoading || isUserDocLoading || isAdminDocLoading;
  const isAdmin = !!adminData || isSuperAdminEmail;

  useEffect(() => {
    if (isLoading || !authUser) return;

    if (isSuperAdminEmail && !adminData && !isAdminDocLoading) {
      const newAdminDocRef = doc(firestore, 'admins', authUser.uid);
      setDocumentNonBlocking(newAdminDocRef, {
        id: authUser.uid,
        email: authUser.email,
        userName: 'SuperAdmin',
        createdAt: Date.now(),
      }, {});
    }
  }, [isLoading, authUser, adminData, isSuperAdminEmail, isAdminDocLoading, firestore]);
  
  if (!isAuthLoading && !authUser && !pathname.startsWith('/logout') && !pathname.startsWith('/login') && !pathname.startsWith('/legal')) {
    return redirect('/login');
  }

  if (isLoading && !pathname.startsWith('/admin') && !pathname.startsWith('/legal')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <p className="text-sm text-muted-foreground animate-pulse font-mono tracking-widest uppercase">Initializing ATLAS...</p>
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar className="hidden md:flex">
        <SideNav />
      </Sidebar>
      <SidebarInset className={cn(
          settings?.accessibility?.dyslexiaFont && "font-dyslexia",
          settings?.accessibility?.highContrast && "high-contrast",
          "flex flex-col min-h-svh pb-16 md:pb-0"
      )}>
        <AnnouncementBanner />
        <AppHeader />
        <Suspense fallback={<div className="p-8"><Skeleton className="h-96 w-full" /></div>}>
          <NavigationGuard user={user} isAdmin={isAdmin} isLoading={isLoading}>
            <main className="p-4 md:p-8 flex-1">{children}</main>
          </NavigationGuard>
        </Suspense>
        <Footer />
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
