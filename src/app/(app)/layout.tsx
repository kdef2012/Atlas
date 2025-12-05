
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
          // **ADMIN HOT-PATH**: If the user is the known admin, immediately send to the admin dashboard.
          // This check is safe to run early because it doesn't depend on the user doc.
          if (authUser && authUser.email === 'kdef2012@gmail.com') {
            if (!pathname.startsWith('/admin')) {
              router.push('/admin');
            }
            return;
          }
      
          // Wait until ALL loading is fully complete before making any other decisions.
          if (isLoading) {
            return;
          }
      
          // After loading, if there's no authenticated user, redirect to login.
          if (!authUser) {
            return redirect('/login');
          }
      
          // After loading, if there IS an authenticated user but NO user document,
          // it means they are a new user who needs to complete onboarding.
          if (authUser && !user && !pathname.startsWith('/onboarding')) {
            router.push('/onboarding/archetype');
            return;
          }
      
          // After loading, if an existing user (auth user + user doc) lands on an onboarding page,
          // redirect them to the dashboard.
          if (user && pathname.startsWith('/onboarding')) {
            router.push('/dashboard');
            return;
          }
        }, [isLoading, authUser, user, pathname, router]);

        // While initial authentication is happening, show a full-screen loader.
        if (isAuthLoading) {
          return (
            <div className="flex h-screen w-screen items-center justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          );
        }
        
        // If auth is checked but no user, we've likely started a redirect. Render null.
        if (!authUser) {
            return null;
        }

        // If a new user is being redirected to onboarding, show a loader to prevent content flash.
        if (!user && !pathname.startsWith('/onboarding') && authUser.email !== 'kdef2012@gmail.com') {
            return (
                <div className="flex h-screen w-screen items-center justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                </div>
            );
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
