"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock5, Component, Flag, LayoutDashboard, LockKeyhole, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    // Exact match for dashboard to prevent it from highlighting on all /admin routes
    if (path === "/admin") {
      return pathname === "/admin";
    }
    // Starts-with match for other routes so nested pages (like /admin/equipment/add) keep the sidebar active
    return pathname.startsWith(path);
  };

  // Reusable button styles based on active state
  const getButtonStyles = (path: string) => cn(
    "justify-start w-full text-sm h-9 px-3 transition-colors",
    isActive(path)
      ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-zinc-100"
      : "font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
  );

  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white dark:bg-zinc-950 border-r py-6 px-4 shrink-0 gap-8 overflow-y-auto">
      
      {/* Overview Section */}
      <div className="flex flex-col gap-1">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Overview
        </h4>
        <Button variant="ghost" className={getButtonStyles("/admin")} asChild>
          <Link href="/admin" className="flex gap-3 items-center">
            <LayoutDashboard className="w-4 h-4"/> <span>Dashboard</span>
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/admin/approval")} asChild>
          <Link href="/admin/approval" className="flex gap-3 items-center">
            <Clock5 className="w-4 h-4"/> <span>Approval</span>
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/admin/schedule")} asChild>
          <Link href="/admin/schedule" className="flex gap-3 items-center">
            <CalendarCheck className="w-4 h-4"/> <span>Schedule</span>
          </Link>
        </Button>
      </div>
      
      {/* Inventory Section */}
      <div className="flex flex-col gap-1">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Inventory
        </h4>
        <Button variant="ghost" className={getButtonStyles("/admin/equipment")} asChild>
          <Link href="/admin/equipment" className="flex gap-3 items-center">
            <Component className="w-4 h-4"/> <span>Equipment</span>
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/admin/damageReport")} asChild>
          <Link href="/admin/damageReport" className="flex gap-3 items-center">
            <Flag className="w-4 h-4"/> <span>Damage Report</span>
          </Link>
        </Button>
      </div>
      
      {/* People Section */}
      <div className="flex flex-col gap-1">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          People
        </h4>
        <Button variant="ghost" className={getButtonStyles("/admin/members")} asChild>
          <Link href="/admin/members" className="flex gap-3 items-center">
            <Users className="w-4 h-4"/> <span>Members</span>
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/admin/roles")} asChild>
          <Link href="/admin/roles" className="flex gap-3 items-center">
            <LockKeyhole className="w-4 h-4"/> <span>Roles & access</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}