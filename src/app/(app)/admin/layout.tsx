
'use client';
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { redirect } from "next/navigation";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldOff, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // Create a stable reference to the user document path
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  // This is the core logic change.
  // We determine the final loading state FIRST, before any rendering logic.
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  useEffect(() => {
    // This effect runs once after the initial loading is complete.
    // If we have an authenticated admin user, but their Firestore document doesn't exist, we create it.
    if (!isLoading && authUser && !user && authUser.email === 'kdef2012@gmail.com') {
      const adminUserRef = doc(firestore, 'users', authUser.uid);
      const adminUserData: Partial<User> = {
        id: authUser.uid,
        email: authUser.email,
        userName: authUser.email?.split('@')[0] || 'Admin',
        isAdmin: true,
        // Set default non-null values for a lean admin object to satisfy the User type
        archetype: 'Titan',
        physicalStat: 0, mentalStat: 0, socialStat: 0, practicalStat: 0, creativeStat: 0,
        lastLogTimestamp: Date.now(),
        createdAt: Date.now(),
        level: 99, xp: 0,
        userSkills: {},
        momentumFlameActive: false,
        gems: 0,
        streakFreezes: 0,
      };
      setDocumentNonBlocking(adminUserRef, adminUserData, { merge: true });
    }
  }, [isLoading, authUser, user, firestore]);

  // If authentication is finished and there's no user, redirect to login.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // If we are still loading authentication state OR the user document, show a loading screen.
  // This is the crucial part that prevents children from rendering prematurely.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  // After loading, if there's a user but they are NOT an admin, show Access Denied.
  if (user && !user.isAdmin) {
    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <ShieldOff className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have the required permissions to view the admin dashboard.</AlertDescription>
            </Alert>
        </div>
    );
  }
  
  // After loading, if there's an authenticated user but their document *still* doesn't exist
  // (which could happen for a non-admin user trying to access /admin directly), deny access.
  if (!user) {
     return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <ShieldOff className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>User profile not found.</AlertDescription>
            </Alert>
        </div>
    );
  }

  // If all checks pass (authenticated, user doc loaded, IS an admin), render the admin content.
  return <>{children}</>;
}
