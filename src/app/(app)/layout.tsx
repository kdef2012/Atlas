
'use client';
import type { ReactNode } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  // If auth has loaded but there's no authenticated user, send to login
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // If auth user exists, but the user document doesn't (or is still loading),
  // they are a new user. Send to onboarding immediately. This takes priority over the loading skeleton.
  if (authUser && !user) {
    if (isLoading) {
       // While the user doc is loading, we can't be sure if they are new or not.
       // But if we let it render the skeleton, a new user might see it briefly.
       // The best experience for a new user is to go directly to onboarding.
       // If an existing user sees a flicker of the onboarding page, it's a minor issue
       // as they will be redirected back to the dashboard once their user doc loads.
       // This prioritizes the new user experience.
       const isPotentiallyNewUser = isUserDocLoading && !user;
       if (isPotentiallyNewUser) {
         return redirect('/onboarding/archetype');
       }
    } else {
        // If loading is finished and there's still no user doc, they are definitely new.
        return redirect('/onboarding/archetype');
    }
  }

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">
      <Skeleton className="h-16 w-16 rounded-full" />
    </div>
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
