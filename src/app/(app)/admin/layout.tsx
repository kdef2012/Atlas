
'use client';
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useUser, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldOff, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);
  
  const isStillAuthenticating = isAuthLoading || !authUser;
  const isStillLoadingUserDoc = authUser && isUserDocLoading;

  useEffect(() => {
    // Auto-provision admin user document if it doesn't exist upon login.
    // This runs once when the user is authenticated but their document is confirmed to not exist.
    if (!isUserDocLoading && authUser && !user && authUser.email === 'kdef2012@gmail.com') {
      console.log('Provisioning new admin user document...');
      const adminUserRef = doc(firestore, 'users', authUser.uid);
      const adminUserData: Partial<User> = {
        id: authUser.uid,
        email: authUser.email,
        userName: authUser.email?.split('@')[0] || 'Admin',
        isAdmin: true,
        level: 99,
        xp: 0,
        createdAt: Date.now(),
        lastLogTimestamp: Date.now(),
        archetype: 'Titan', // Placeholder, not used for routing or game logic for admin
        physicalStat: 0,
        mentalStat: 0,
        socialStat: 0,
        practicalStat: 0,
        creativeStat: 0,
        userSkills: {},
        avatarLayers: {},
        momentumFlameActive: false,
        gems: 0,
        streakFreezes: 0,
        traits: {},
      };
      // Create the document non-blockingly. The useDoc hook will automatically
      // pick up the change, causing a re-render.
      setDocumentNonBlocking(adminUserRef, adminUserData, { merge: true });
    }
  }, [isUserDocLoading, authUser, user, firestore]);

  // If auth has finished and there's no user, redirect to login.
  if (!isStillAuthenticating && !authUser) {
    return redirect('/login');
  }

  // Show a full-screen loading state while we're verifying the user and their Firestore document.
  // This prevents child components from rendering prematurely and causing permission errors.
  if (isStillAuthenticating || isStillLoadingUserDoc) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }
  
  // After loading, if we have a user but they are not an admin, show access denied.
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
  
  // After loading, if the user document still doesn't exist for the admin email (should be rare),
  // show a message instead of rendering children, as the useEffect will be attempting to create it.
  if (!user) {
      return (
         <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Finalizing account setup...</p>
            </div>
        </div>
      )
  }

  // If all checks pass (authenticated, user doc loaded, is an admin), render the admin content.
  return <>{children}</>;
}
