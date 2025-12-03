
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { SuggestionDialog } from "@/components/admin/SuggestionDialog";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export function AppHeader() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here later */}
      </div>
      <div>
        {user && !user.isAdmin && <SuggestionDialog />}
      </div>
    </header>
  );
}
