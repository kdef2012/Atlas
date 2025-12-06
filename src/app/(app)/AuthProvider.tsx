
'use client';
import type { ReactNode } from "react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { redirect, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  // This is the crucial loading state. It waits for auth to resolve, and if there's an auth user,
  // it also waits for the user document to resolve.
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  // 1. Strict Loading Gate: Render a loader and do nothing else until all data is settled.
  // This prevents any premature redirects.
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading ATLAS...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Gate: If loading is finished and there's no authUser, they must log in.
  if (!authUser) {
    return redirect('/login');
  }

  const isAdmin = authUser.email === 'kdef2012@gmail.com';

  // 3. New User Gate: If it's not an admin, and the user doc doesn't exist, they need to onboard.
  // This now only runs AFTER isLoading is false, guaranteeing 'user' is truly null and not just loading.
  if (!isAdmin && !user && !pathname.startsWith('/onboarding')) {
    return redirect('/onboarding/archetype');
  }

  // 4. Existing User Gate: If an existing user lands on onboarding, send them to the dashboard.
  if (!isAdmin && user && pathname.startsWith('/onboarding')) {
    return redirect('/dashboard');
  }

  // 5. Admin Routing: If an admin is not in the admin section, redirect them there.
  if (isAdmin && !pathname.startsWith('/admin')) {
      return redirect('/admin');
  }
  
  // If all checks pass, render the main app content.
  return <>{children}</>;
}
