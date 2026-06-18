"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const AUTH_ROUTES = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
<div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="pt-20 flex-1 overflow-auto px-4 sm:px-6 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
