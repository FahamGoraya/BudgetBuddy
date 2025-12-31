"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/budgets", label: "Budgets" },
  { href: "/recurring", label: "Recurring" },
  { href: "/analytics", label: "Analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">
            B
          </div>
          <div>
            <h1 className="text-xl font-bold">BudgetBuddy</h1>
            <p className="text-gray-400 text-xs">Expense Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/30"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${pathname === item.href ? "bg-white" : "bg-gray-600"}`} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">Quick Stats</p>
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">This Month</span>
              <span className="text-white font-semibold">$1,234</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full w-3/4" />
            </div>
            <p className="text-xs text-gray-500">75% of monthly budget used</p>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700/50">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {user?.avatar || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
