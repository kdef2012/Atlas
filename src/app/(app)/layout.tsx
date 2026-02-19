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
import { useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { redirect, useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User, UserSettings } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  // Primary user profile
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  // Admin profile
  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  // User settings for global accessibility
  const settingsRef = useMemoFirebase(() => authUser ? doc(firestore, `users/${authUser.uid}/settings/main`) : null, [firestore, authUser]);
  const { data: settings } = useDoc<UserSettings>(settingsRef);

  // Hardcoded super-admin bootstrap check
  const isSuperAdminEmail = authUser?.email === 'kdef2012@gmail.com';

  // Comprehensive loading state
  const isLoading = isAuthLoading || isUserDocLoading || isAdminDocLoading;

  useEffect(() => {
    // Only make routing decisions once all authentication and profile checks are definitive
    if (isLoading || !authUser) return;

    // Handle SuperAdmin bootstrap
    if (isSuperAdminEmail && !adminData && !isAdminDocLoading) {
      const newAdminDocRef = doc(firestore, 'admins', authUser.uid);
      setDocumentNonBlocking(newAdminDocRef, {
        id: authUser.uid,
        email: authUser.email,
        userName: 'SuperAdmin',
        createdAt: Date.now(),
      }, {});
      return; 
    }

    const isAdmin = !!adminData || isSuperAdminEmail;
    const isPaywallPage = pathname === '/paywall';
    const isOnboardingPage = pathname.startsWith('/onboarding');
    
    // If they are an admin, let them go anywhere
    if (isAdmin) return;

    // Paywall Redirect (Monetization 2)
    // Only block if explicitly set to false. If undefined (old user), they pass (Grandfathering).
    if (user && user.hasPaidAccess === false) {
      if (!isPaywallPage) {
        router.replace('/paywall');
      }
      return;
    }

    // If on paywall but has access, get them out
    if (isPaywallPage && user?.hasPaidAccess) {
      router.replace('/dashboard');
      return;
    }

    // Standard Onboarding Redirection
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
  }, [
    isLoading,
    authUser,
    user,
    adminData,
    isSuperAdminEmail,
    isAdminDocLoading,
    router,
    pathname,
    firestore
  ]);
  
  // Protect the entire (app) group
  if (!isAuthLoading && !authUser && !pathname.startsWith('/logout') && !pathname.startsWith('/login')) {
    return redirect('/login');
  }

  // Show a clean loading state while deciding
  if (isLoading && !pathname.startsWith('/admin')) {
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
      <Sidebar>
        <SideNav />
      </Sidebar>
      <SidebarInset className={cn(
          settings?.accessibility?.dyslexiaFont && "font-dyslexia",
          settings?.accessibility?.highContrast && "high-contrast"
      )}>
        <AnnouncementBanner />
        <AppHeader />
        <main className="p-4 md:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}