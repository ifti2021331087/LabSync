"use client";

import {
  MenuIcon,
  LayoutList,
  SquareChartGantt,
  Send,
  History,
  TriangleAlert,
  Bell,
  LayoutDashboard,
  Clock5,
  CalendarCheck,
  Component,
  Flag,
  Users,
  LockKeyhole
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ModeToggle } from "../theme/moodToogle";
import Image from "next/image";
import UserMenu from "../auth/user-menu";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === 'admin';
  const pathName = usePathname();
  const isAuthPage: boolean = (pathName === "/auth/signIn") || (pathName === "/auth/signUp");

  if (isAuthPage) return null;

  // Helper to check if link is active (includes exact match logic for base routes)
  const isActive = (path: string, exact = false) => {
    if (exact || path === "/" || path === "/admin") {
      return pathName === path;
    }
    return pathName.startsWith(path);
  };

  // Mobile navigation link styling matching the sidebar theme
  const getMobileNavStyles = (path: string, exact = false) => cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all",
    isActive(path, exact)
      ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-zinc-100"
      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="mx-auto h-16 flex items-center justify-between px-4">

        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <Link href={"/"} className="flex gap-2 items-center">
            <Image src={"/mechanical-engineering.svg"} width={20} height={20} alt="home" />
            <span className="font-bold text-xl text-black dark:text-white hover:opacity-80 transition-opacity">
              LabSync
            </span>
          </Link>
        </div>

        {/* Right Side: Profile Dropdown & Mobile Menu */}
        <div className="flex items-center gap-3">
          <ModeToggle />
          
          <UserMenu />

          {/* Mobile Menu Drawer (Hidden on Desktop) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] flex flex-col overflow-y-auto">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Image src={"/mechanical-engineering.svg"} width={20} height={20} alt="logo" />
                    <span className="font-bold tracking-wide">Menu</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-6 flex-1 pb-6">
                  
                  {/* --- USER NAVIGATION --- */}
                  {!isPending && !isAdmin && (
                    <>
                      <div className="flex flex-col gap-1">
                        <h4 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Browse
                        </h4>
                        <SheetClose>
                          <Link href={"/"} className={getMobileNavStyles("/")}>
                            <LayoutList className="w-4 h-4" /> Equipment
                          </Link>
                        </SheetClose>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          My Activity
                        </h4>
                        <SheetClose>
                          <Link href={"/checkouts"} className={getMobileNavStyles("/checkouts")}>
                            <SquareChartGantt className="w-4 h-4" /> My Checkouts
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/requests"} className={getMobileNavStyles("/requests")}>
                            <Send className="w-4 h-4" /> My Requests
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/history"} className={getMobileNavStyles("/history")}>
                            <History className="w-4 h-4" /> History
                          </Link>
                        </SheetClose>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Support
                        </h4>
                        <SheetClose>
                          <Link href={"/reportDamage"} className={getMobileNavStyles("/reportDamage")}>
                            <TriangleAlert className="w-4 h-4" /> Report Damage
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/notifications"} className={getMobileNavStyles("/notifications")}>
                            <Bell className="w-4 h-4" /> Notifications
                          </Link>
                        </SheetClose>
                      </div>
                    </>
                  )}

                  {/* --- ADMIN NAVIGATION --- */}
                  {!isPending && isAdmin && (
                    <>
                      <div className="flex flex-col gap-1">
                        <h4 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Overview
                        </h4>
                        <SheetClose>
                          <Link href={"/admin"} className={getMobileNavStyles("/admin", true)}>
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/admin/approval"} className={getMobileNavStyles("/admin/approval")}>
                            <Clock5 className="w-4 h-4" /> Approval
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/admin/schedule"} className={getMobileNavStyles("/admin/schedule")}>
                            <CalendarCheck className="w-4 h-4" /> Schedule
                          </Link>
                        </SheetClose>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Inventory
                        </h4>
                        <SheetClose>
                          <Link href={"/admin/equipment"} className={getMobileNavStyles("/admin/equipment")}>
                            <Component className="w-4 h-4" /> Equipment
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/admin/damageReport"} className={getMobileNavStyles("/admin/damageReport")}>
                            <Flag className="w-4 h-4" /> Damage Report
                          </Link>
                        </SheetClose>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          People
                        </h4>
                        <SheetClose>
                          <Link href={"/admin/members"} className={getMobileNavStyles("/admin/members")}>
                            <Users className="w-4 h-4" /> Members
                          </Link>
                        </SheetClose>
                        <SheetClose>
                          <Link href={"/admin/roles"} className={getMobileNavStyles("/admin/roles")}>
                            <LockKeyhole className="w-4 h-4" /> Roles & Access
                          </Link>
                        </SheetClose>
                      </div>
                    </>
                  )}

                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}