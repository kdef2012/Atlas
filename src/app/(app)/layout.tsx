
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
      import { useUser, useDoc, useMemoFirebase } from "@/firebase";
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

        const isLoading = isAuthLoading || (authUser && isUserDocLoading);

        useEffect(() => {
          // Wait until all loading is complete before making any decisions
          if (isLoading) {
            return;
          }

          // Case 1: No authenticated user. Redirect to login.
          if (!authUser) {
            return redirect('/login');
          }

          // Case 2: Authenticated user, but no user document found in Firestore.
          // This means they are a new user who hasn't completed onboarding.
          if (!user && !pathname.startsWith('/onboarding')) {
              router.push('/onboarding/archetype');
          }

          // Case 3: Existing user trying to access onboarding. Redirect to dashboard.
          if (user && pathname.startsWith('/onboarding')) {
            router.push('/dashboard');
          }

        }, [isLoading, authUser, user, pathname, router]);

        // While initial authentication is happening, show a full-screen loader.
        // This prevents showing the app layout to a user who will be redirected.
        if (isAuthLoading) {
          return (
            <div className="flex h-screen w-screen items-center justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          );
        }
        
        // After auth is checked, if there's no user, we've already started the redirect.
        // We can render null or a loader to prevent a flash of content.
        if (!authUser) {
            return null;
        }

        // If all checks pass, render the main app.
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
