
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
  ScrollText,
  ShieldCheck,
  Building2,
  Store,
  User as UserIcon,
  Shield,
  Palette,
  Megaphone,
  Trophy,
} from "lucide-react";
import { useUser, useDoc, useAuth, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { TwinskieAvatar } from "@/components/twinskie-avatar-openpeeps";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/nebula", label: "Nebula", icon: Atom },
  { href: "/quests", label: "Quests", icon: ScrollText },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/store", label: "Store", icon: Store },
  { href: "/fireteams", label: "Fireteams", icon: Users },
  { href: "/guilds", label: "Guilds", icon: Building2 },
  { href: "/turf-wars", label: "Faction Challenges", icon: Map },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminNavItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/curation", label: "Curation", icon: Palette },
    { href: "/admin/events", label: "Events", icon: Megaphone },
]

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/login');
    });
  }

  const isAdmin = user?.isAdmin === true;

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
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                tooltip={{ children: item.label, side: "right" }}
              >
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {isAdmin && (
            <>
                <SidebarSeparator className="my-2" />
                 <div className="px-4 text-xs font-semibold text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">Admin</div>
                {adminNavItems.map((item) => (
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
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
           {user && <TwinskieAvatar user={user} size="sm" showInactiveLabel={false} />}
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-bold text-sm">{user?.userName || 'Username'}</p>
              <p className="text-xs text-muted-foreground">Level {user?.level || 0}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto group-data-[collapsible=icon]:hidden">
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
        </div>
      </SidebarFooter>
    </>
  );
}
