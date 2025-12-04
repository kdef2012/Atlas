
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
import { ShieldOff } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  useEffect(() => {
    // ** CRITICAL FIX **: Auto-provision admin user document if it doesn't exist.
    if (!isUserDocLoading && authUser && !user && authUser.email === 'kdef2012@gmail.com') {
      const adminUserRef = doc(firestore, 'users', authUser.uid);
      const adminUserData: Partial<User> = {
        id: authUser.uid,
        email: authUser.email,
        userName: authUser.email?.split('@')[0] || 'Admin',
        isAdmin: true,
        level: 99, // Assign a high level to distinguish from players
        xp: 0,
        createdAt: Date.now(),
        lastLogTimestamp: Date.now(),
        // Set default empty values for game-related fields an admin doesn't use.
        archetype: 'Titan', // Placeholder, not used for routing
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
      // Create the document non-blockingly. The hook will pick up the change.
      setDocumentNonBlocking(adminUserRef, adminUserData, { merge: true });
    }
  }, [isUserDocLoading, authUser, user, firestore]);

  // If auth is still loading, show a skeleton.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    );
  }
  
  // If auth has finished loading and there is NO authenticated user, redirect to login.
  if (!authUser) {
    return redirect('/login');
  }

  // If we have a user but they are not an admin, deny access.
  if (user && !user.isAdmin) {
    return (
        <Alert variant="destructive" className="max-w-lg mx-auto mt-8">
            <ShieldOff className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You do not have permission to view this page.</AlertDescription>
        </Alert>
    );
  }

  // If all checks pass (authenticated and is admin or doc still loading), render the content.
  return <>{children}</>;
}
