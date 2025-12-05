
'use client';
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { redirect } from "next/navigation";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldOff, Loader2 } from "lucide-react";

// Define a simple type for the Admin document
interface AdminUser {
  id: string;
  email: string;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // Create a stable reference specifically to the /admins collection
  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminUser, isLoading: isAdminDocLoading } = useDoc<AdminUser>(adminRef);

  const isLoading = isAuthLoading || (authUser && isAdminDocLoading);

  // If auth is done and there's no logged-in user, redirect.
  if (!isAuthLoading && !authUser) {
    return redirect('/login');
  }

  // Show a loading screen while we verify admin status.
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

  // After loading, if there's no document in the /admins collection for this user, deny access.
  if (!adminUser) {
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

  // If all checks pass (authenticated and an admin doc exists), render the admin content.
  return <>{children}</>;
}

    