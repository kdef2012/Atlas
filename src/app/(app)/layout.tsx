
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

  const isLoading = isAuthLoading || (authUser && (isUserDocLoading || isAdminDocLoading));
  const isAdminLogin = authUser?.email === 'kdef2012@gmail.com';

  useEffect(() => {
    // This is the main redirection logic for new users and admin setup.
    if (!isLoading && authUser) {
      if (isAdminLogin) {
        // If the user is the designated admin but has no admin document, create one.
        if (!adminData) {
            const adminCollection = collection(firestore, 'admins');
            const newAdminDocRef = doc(adminCollection, authUser.uid);
            // This is a special, one-time setup for the super admin.
            setDocumentNonBlocking(newAdminDocRef, {
                id: authUser.uid,
                email: authUser.email,
                userName: 'SuperAdmin',
                createdAt: Date.now(),
            }, {});
        }
        // BUGFIX: The faulty redirect logic was here. It has been removed.
        // The AdminLayout handles security, and this was preventing navigation
        // from the admin view to the user view.

      } else if (!user && !pathname.startsWith('/onboarding')) {
        // If a regular user is logged in but has no user document, send to onboarding.
        router.push('/onboarding/archetype');
      }
    }
  }, [isLoading, authUser, user, adminData, isAdminLogin, router, pathname, firestore]);


  // If auth has loaded but there's no authenticated user, send to login.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // While the initial user authentication or Firestore document is loading, show a skeleton.
  if (isLoading && !pathname.startsWith('/onboarding')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }

  // If an existing user tries to access onboarding, send them to the dashboard.
  if (user && pathname.startsWith('/onboarding')) {
    return redirect('/dashboard');
  }
  
  // The AdminLayout is a child of this layout and will handle its own UI and logic for admins.
  // For non-admins, this layout provides the main app structure.
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
