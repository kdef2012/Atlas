
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
  MessageSquare,
  Radio,
} from "lucide-react";
import { useUser, useDoc, useAuth, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { TwinskieAvatarCompact } from "@/components/TwinskiAvatarCompact";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/nebula", label: "Nebula", icon: Atom },
  { href: "/quests", label: "Quests", icon: ScrollText },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/echoes", label: "Echoes", icon: MessageSquare },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/store", label: "Store", icon: Store },
  { href: "/fireteams", label: "Fireteams", icon: Users },
  { href: "/guilds", label: "Guilds", icon: Building2 },
  { href: "/turf-wars", label: "Faction Challenges", icon: Map },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminNavItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/curation", label: "Curation", icon: Palette },
    { href: "/admin/events", label: "Events", icon: Megaphone },
]

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  // Check both /users and /admins to determine role and get display info
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user } = useDoc<User>(userRef);

  const adminRef = useMemoFirebase(() => authUser ? doc(firestore, 'admins', authUser.uid) : null, [firestore, authUser]);
  const { data: adminData } = useDoc(adminRef);

  const handleLogout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      // Hard redirect - forces full page reload, avoids React hooks issues
      window.location.href = '/logout';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Determine if the user is an admin based on the existence of their doc in /admins
  const isAdmin = !!adminData;
  const isViewingAdminSection = pathname.startsWith('/admin');

  // Determine what user data to display in the footer
  const displayUser = isViewingAdminSection && isAdmin ? {
      ...(adminData as object),
      id: authUser?.uid || '',
      userName: (adminData as any)?.userName || 'Admin',
      level: 99, // Admins are special
      avatarStyle: undefined, // No avatar for admins in this simple setup
      lastLogTimestamp: Date.now(), // Ensure admin is always considered active
  } : user;


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
          {isViewingAdminSection && isAdmin ? (
             <>
                <div className="px-4 text-xs font-semibold text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">Admin</div>
                {adminNavItems.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.label, side: "right" }}
                            >
                                <Link href={item.href}>
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
                <SidebarSeparator className="my-2" />
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip={{ children: 'User Dashboard', side: "right" }}
                    >
                        <Link href={'/dashboard'}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span>User View</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </>
          ) : (
             navItems.map((item) => (
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
            ))
          )}
           {isAdmin && !isViewingAdminSection && (
            <>
                <SidebarSeparator className="my-2" />
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith('/admin')}
                        tooltip={{ children: 'Admin Dashboard', side: "right" }}
                    >
                        <Link href={'/admin'}>
                        <Shield className="w-5 h-5" />
                        <span>Admin View</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
           {displayUser && ('avatarStyle' in displayUser || 'avatarUrl' in displayUser) ? 
                <TwinskieAvatarCompact user={displayUser as User} size={40} showInactive={false} /> 
                : 
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><Shield/></div>
            }
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-bold text-sm">{displayUser?.userName || 'User'}</p>
              <p className="text-xs text-muted-foreground">Level { (displayUser && 'level' in displayUser) ? displayUser?.level : 0}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className="ml-auto group-data-[collapsible=icon]:hidden text-muted-foreground hover:text-destructive">
                        <LogOut className="w-5 h-5" />
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your journey will be saved, but you will need to sign back in to continue.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Stay in ATLAS</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                        Goodbye ATLAS
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </SidebarFooter>
    </>
  );
}

    