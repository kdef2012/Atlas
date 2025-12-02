
'use client';
import type { ReactNode } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">
      <Skeleton className="h-16 w-16" />
    </div>
  }

  if (!user) {
    return redirect('/onboarding/archetype');
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SideNav />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="p-4 md:p-8 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
