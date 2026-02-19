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
import type { User } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

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
      return; // Allow the document creation to trigger a re-render
    }

    const isAdmin = !!adminData || isSuperAdminEmail;
    const isOnboardingPage = pathname.startsWith('/onboarding');
    
    // ✅ FIXED: Profile is complete if it has BOTH avatarUrl AND baseAvatarUrl
    // This ensures the avatar generation actually completed
    const isProfileComplete = !!(user?.avatarUrl && user?.baseAvatarUrl);

    // If they are an admin, let them go anywhere
    if (isAdmin) return;

    // Redirection Logic for Standard Users
    if (!user) {
      // No profile doc at all - send to start of onboarding
      if (!isOnboardingPage) {
        router.replace('/onboarding/archetype');
      }
    } else if (!isProfileComplete) {
      // Profile exists but haven't finished customization
      // We check !isOnboardingPage to avoid interrupting the current onboarding steps
      if (!isOnboardingPage) {
        router.replace('/onboarding/archetype');
      }
    } else if (isProfileComplete && pathname === '/onboarding/archetype') {
      // Profile is done but user tried to go back to origin - send to dashboard
      router.replace('/dashboard');
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
      <SidebarInset>
        <AnnouncementBanner />
        <AppHeader />
        <main className="p-4 md:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
