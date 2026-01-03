"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  RefreshCcw, 
  BarChart3, 
  LogOut,
  Sparkles,
  TrendingUp,
  ChevronRight,
  MessageCircle
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-emerald-500 to-teal-600" },
  { href: "/expenses", label: "Expenses", icon: Receipt, color: "from-amber-500 to-orange-600" },
  { href: "/budgets", label: "Budgets", icon: Wallet, color: "from-lime-500 to-green-600" },
  { href: "/recurring", label: "Recurring", icon: RefreshCcw, color: "from-yellow-500 to-amber-600" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, color: "from-teal-500 to-emerald-600" },
  { href: "/chat", label: "Chat with BudgetBuddy", icon: MessageCircle, color: "from-cyan-500 to-sky-600" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-72 min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(10, 10, 18, 0.99) 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-20 w-32 h-32 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Logo Section */}
      <div className="p-6 relative z-10">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
            >
              B
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">BudgetBuddy</h1>
            <p className="text-xs text-gray-500">Smart Finance Manager</p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 relative z-10">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-4 px-3">
          Navigation
        </p>
        <ul className="space-y-1">
          <AnimatePresence>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <motion.li 
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={item.href}>
                    <motion.div
                      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-15`}
                          style={{ 
                            boxShadow: '0 0 30px -5px rgba(16, 185, 129, 0.3)'
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      
                      {/* Hover background */}
                      {!isActive && (
                        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-all duration-300" />
                      )}
                      
                      {/* Active indicator line */}
                      {isActive && (
                        <motion.div
                          layoutId="activeLine"
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${item.color}`}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      
                      <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-br ${item.color} shadow-lg` 
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                      </div>
                      
                      <span className="relative font-medium text-[15px]">{item.label}</span>
                      
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-gray-500" />
                      )}
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        {/* Stats Card */}
        <motion.div 
          className="mt-8 mx-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Monthly Overview</span>
            </div>
            
            <p className="text-2xl font-bold text-white mb-1">$2,847.50</p>
            <p className="text-xs text-gray-400 mb-4">Total expenses this month</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Budget Used</span>
                <span className="text-white font-medium">68%</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #10b981, #f59e0b)' }}
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* User Profile Section */}
      <motion.div 
        className="p-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="rounded-2xl p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)' }}
              >
                {user?.avatar || user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          
          <motion.button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-white rounded-xl transition-all duration-300"
            style={{ background: 'rgba(255, 255, 255, 0.03)' }}
            whileHover={{ scale: 1.02, background: 'rgba(239, 68, 68, 0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
