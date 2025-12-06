
'use client';
import type { ReactNode } from "react";
import { AppHeader } from "@/components/common/AppHeader";
import { SideNav } from "@/components/common/SideNav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AuthProvider } from "./AuthProvider";
import { AnnouncementBanner } from "@/components/common/AnnouncementBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SideNav />
      </Sidebar>
      <SidebarInset>
        <AnnouncementBanner />
        <AppHeader />
        <main className="p-4 md:p-8 flex-1">
          <AuthProvider>{children}</AuthProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
