
'use client';
import type { ReactNode } from "react";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import Link from 'next/link';
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldOff, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // Point to the /admins collection for verification. This is the crucial check.
  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData, isLoading: isAdminDocLoading } = useDoc(adminRef);

  const isLoading = isAuthLoading || (!!authUser && isAdminDocLoading);

  // While we verify auth and admin status, show a loader.
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

  // After loading, if there is no authenticated user OR the admin document doesn't exist, deny access.
  if (!authUser || !adminData) {
    return (
        <div className="flex h-screen w-screen items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <ShieldOff className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription className="mb-4">
                    You do not have the required permissions to view the admin dashboard.
                </AlertDescription>
                <Button asChild variant="outline">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Return to Home
                    </Link>
                </Button>
            </Alert>
        </div>
    );
  }

  // If all checks pass, render the admin content.
  return <>{children}</>;
}
