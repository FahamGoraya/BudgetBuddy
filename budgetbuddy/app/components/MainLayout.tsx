"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/";
  const isOnboardingPage = pathname === "/onboarding";

  useEffect(() => {
    if (!isAuthenticated && !isLoginPage && !isOnboardingPage) {
      router.push("/");
    }
  }, [isAuthenticated, isLoginPage, isOnboardingPage, router]);

  if (isLoginPage || isOnboardingPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen relative" style={{ background: '#0a0a0f' }}>
      {/* Background decorative elements */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />
      
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  );
}
