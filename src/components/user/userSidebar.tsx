"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, History, LayoutList, Send, SquareChartGantt, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserSidebar() {
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (path: string) => pathname === path;

  // Reusable button styles based on active state
  const getButtonStyles = (path: string) => cn(
    "justify-start w-full text-sm h-9 px-3 transition-colors",
    isActive(path)
      ? "bg-zinc-100 text-zinc-900 font-semibold dark:bg-zinc-800 dark:text-zinc-100"
      : "font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
  );

  return (
    <aside className="hidden md:flex w-[260px] flex-col bg-white dark:bg-zinc-950 border-r py-6 px-4 shrink-0 gap-8 overflow-y-auto">
      
      <div className="flex flex-col gap-1">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Browse
        </h4>
        <Button variant="ghost" className={getButtonStyles("/")} asChild>
          <Link href="/" className="flex gap-3 items-center">
            <LayoutList className="w-4 h-4" /> Equipment
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          My Activity
        </h4>
        <Button variant="ghost" className={getButtonStyles("/checkouts")} asChild>
          <Link href="/checkouts" className="flex gap-3 items-center">
            <SquareChartGantt className="w-4 h-4" /> My Checkouts
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/requests")} asChild>
          <Link href="/requests" className="flex gap-3 items-center">
            <Send className="w-4 h-4" /> My Requests
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/history")} asChild>
          <Link href="/history" className="flex gap-3 items-center">
            <History className="w-4 h-4" /> History
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Support
        </h4>
        <Button variant="ghost" className={getButtonStyles("/reportDamage")} asChild>
          <Link href="/reportDamage" className="flex gap-3 items-center">
            <TriangleAlert className="w-4 h-4" /> Report Damage
          </Link>
        </Button>
        <Button variant="ghost" className={getButtonStyles("/notifications")} asChild>
          <Link href="/notifications" className="flex gap-3 items-center">
             <Bell className="w-4 h-4" /> Notifications
          </Link>
        </Button>
      </div>

    </aside>
  );
}