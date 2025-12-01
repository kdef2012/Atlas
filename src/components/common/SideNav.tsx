"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Map,
  Settings,
  LogOut,
  Atom,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nebula", label: "Nebula", icon: Atom },
  { href: "/fireteams", label: "Fireteams", icon: Users },
  { href: "/turf-wars", label: "Turf Wars", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'avatar');

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <Atom className="w-8 h-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
            ATLAS
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: "right" }}
              >
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
           <Avatar>
              <AvatarImage src={userAvatar?.imageUrl} data-ai-hint={userAvatar?.imageHint} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-bold text-sm">Username</p>
              <p className="text-xs text-muted-foreground">Level 1</p>
            </div>
            <button className="ml-auto group-data-[collapsible=icon]:hidden">
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
        </div>
      </SidebarFooter>
    </>
  );
}
