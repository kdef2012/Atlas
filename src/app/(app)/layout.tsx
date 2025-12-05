
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

        const isLoading = isAuthLoading || isUserDocLoading;

        useEffect(() => {
          // Wait until all loading is complete before making any decisions
          if (!isLoading && authUser) {
            // If the user is authenticated but has no user document in Firestore,
            // and they are not already trying to onboard, redirect them to the start of onboarding.
            if (!user && !pathname.startsWith('/onboarding')) {
              router.push('/onboarding/archetype');
            }
          }
        }, [isLoading, authUser, user, pathname, router]);

        // If auth has finished loading and there's no user, they must log in.
        if (!isAuthLoading && !authUser) {
          return redirect('/login');
        }

        // Show a loading skeleton while waiting for user data, but not on onboarding pages
        if (isLoading && !pathname.startsWith('/onboarding')) {
          return (
            <div className="flex h-screen w-screen items-center justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          );
        }

        // If a user with a document tries to go back to onboarding, send them to the dashboard.
        if (user && pathname.startsWith('/onboarding')) {
          return redirect('/dashboard');
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
