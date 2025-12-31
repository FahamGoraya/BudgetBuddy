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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
