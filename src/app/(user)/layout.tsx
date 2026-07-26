import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/header/header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserSidebar from "@/components/user/userSidebar";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Equipment",
  description: "Equipment",
};

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
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      {/* 1. Changed to min-h-screen to allow natural scrolling */}
      <body className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-zinc-900/40">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          
          {/* 2. Changed mt-16 to pt-16 to pad the inside instead of pushing the box down */}
          <div className="flex-1 flex w-full pt-16">
            
            <UserSidebar/>
            
            {/* 3. Main content area naturally takes the rest of the space */}
            <main className="flex-1 p-6 md:p-10 min-w-0">
              <div className="max-w-8xl mx-auto">
                {children}
                <Toaster />
              </div>
            </main>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}