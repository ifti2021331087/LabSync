import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/header/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/adminSidebar";

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
    <div className="h-screen flex flex-col font-sans overflow-hidden mt-16">
        <Header />
        
        <div className="flex-1 flex w-full overflow-hidden">
          
          {/* Inject the Client Component sidebar here */}
          <AdminSidebar />

          <main className="flex-1 bg-[#F9FAFB] dark:bg-zinc-900/40 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>

        </div>
    </div>
  );
}