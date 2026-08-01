
import Header from "@/components/header/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import UserSidebar from "@/components/user/userSidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (session && session.user.role === 'admin') {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-zinc-900/40">
      <Header />
      <div className="flex-1 flex w-full pt-16">
        <UserSidebar />
        <main className="flex-1 p-6 md:p-10 min-w-0">
          <div className="max-w-8xl mx-auto">
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </div>
  );
}