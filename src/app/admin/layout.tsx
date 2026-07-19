import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/header/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock5, Component, Flag, LayoutDashboard, LockKeyhole, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Equipment",
  description: "Admin Equipment Dashboard",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if(!session || session.user.role !== 'admin'){
        redirect("/");
    }

  return (
    // Replaced the zinc-50 background on the whole app, and set the container to screen height
    <div className="h-screen flex flex-col font-sans overflow-hidden mt-16">
        {/* Assuming Header is your top nav */}
        <Header />
        
        {/* 
          Main Application Container
          Removed max-w-7xl and mx-auto to make it span the full width of the screen.
          Removed outer padding to let the sidebar touch the left edge.
        */}
        <div className="flex-1 flex w-full overflow-hidden">
          
          {/* 
            Sidebar 
            Added solid background, refined borders, and adjusted padding to match the image.
          */}
          <aside className="hidden md:flex w-[260px] flex-col bg-white dark:bg-zinc-950 border-r py-6 px-4 shrink-0 gap-8 overflow-y-auto">
            
            {/* Overview Section */}
            <div className="flex flex-col gap-1">
              <h4 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Overview
              </h4>
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
                <Link href="/admin" className="flex gap-3 items-center">
                  <LayoutDashboard className="w-4 h-4"/> <span>Dashboard</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
                <Link href="/admin/approval" className="flex gap-3 items-center">
                  <Clock5 className="w-4 h-4"/> <span>Approval</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
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
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
                <Link href="/admin/equipment" className="flex gap-3 items-center">
                  <Component className="w-4 h-4"/> <span>Equipment</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
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
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
                <Link href="/admin/members" className="flex gap-3 items-center">
                  <Users className="w-4 h-4"/> <span>Members</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start w-full text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 h-9 px-3" asChild>
                <Link href="/admin/roles" className="flex gap-3 items-center">
                  <LockKeyhole className="w-4 h-4"/> <span>Roles & access</span>
                </Link>
              </Button>
            </div>
          </aside>

          {/* 
            Main Content Area 
            Added the subtle gray background here so the white cards inside the children will pop.
          */}
          <main className="flex-1 bg-[#F9FAFB] dark:bg-zinc-900/40 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>

        </div>
    </div>
  );
}