"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { 
  TrendingUp, 
  PieChart, 
  Wallet, 
  BarChart3,
  ArrowRight,
  Receipt,
  Target
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-5"
        style={{ 
          background: 'rgba(10, 10, 15, 0.8)', 
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
            >
              B
            </div>
            <span className="text-xl font-bold text-white">BudgetBuddy</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
            <a href="#analytics" className="text-gray-400 hover:text-white transition-colors text-sm">Analytics</a>
          </div>

          <Link 
            href="/login" 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm group"
          >
            Log In 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen pt-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Manage Your
              <br />
              Expenses Easily With
              <br />
              <span className="gradient-text">BudgetBuddy</span>
            </h1>
            
            <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
              We are providing the easiest way to manage expenses. Get a full view so you know where to save. Track spending, detect patterns, and keep tabs on your financial health.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
              }}
            >
              Get Started
            </Link>
          </motion.div>

          {/* Right Side - Bento Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-3 grid-rows-4 gap-3 h-[600px]">
              {/* Top Left - Circular Graph */}
              <motion.div 
                className="col-span-1 row-span-2 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient1)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #10b981, #f59e0b)' }} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 text-center tracking-widest uppercase">Budget Progress</p>
              </motion.div>

              {/* Top Middle - Keep Expense */}
              <motion.div 
                className="col-span-2 row-span-2 rounded-2xl p-6 relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute top-4 right-4 text-right">
                  <p className="text-gray-500 text-xs">-1200$</p>
                  <p className="text-gray-400 text-sm mt-1">Expense</p>
                </div>
                <h3 className="text-white text-xl font-medium mb-8">
                  Keep <span className="gradient-text">Expense</span>
                </h3>
                {/* Line Chart Visualization */}
                <svg className="w-full h-24" viewBox="0 0 200 60" preserveAspectRatio="none">
                  <path 
                    d="M0,40 Q25,45 50,30 T100,35 T150,20 T200,30" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="2"
                  />
                  <path 
                    d="M0,40 Q25,45 50,30 T100,35 T150,20 T200,30" 
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <circle cx="100" cy="35" r="4" fill="#10b981" />
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Middle Row - Wave Pattern */}
              <motion.div 
                className="col-span-2 row-span-1 rounded-2xl p-4 flex items-center relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-full h-12" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path 
                    d="M0,20 Q20,5 40,20 T80,20 T120,20 T160,20 T200,20" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth="2"
                  />
                </svg>
              </motion.div>

              {/* Crystal Clear Box */}
              <motion.div 
                className="col-span-1 row-span-2 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-white text-lg font-medium mb-2">Crystal <span className="gradient-text">Clear</span></h4>
                <div className="relative w-20 h-20 mt-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #10b981, #f59e0b)', filter: 'blur(4px)' }} />
                  </div>
                </div>
              </motion.div>

              {/* Bottom Wave */}
              <motion.div 
                className="col-span-2 row-span-1 rounded-2xl p-4 flex items-center relative overflow-hidden"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-full h-12" viewBox="0 0 200 40" preserveAspectRatio="none">
                  <path 
                    d="M0,20 Q25,35 50,20 T100,20 T150,20 T200,20" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.2)" 
                    strokeWidth="2"
                  />
                </svg>
                <p className="absolute right-4 text-[10px] text-gray-500 tracking-widest uppercase">Spending Pattern</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-12 left-0 right-0 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-8 md:gap-16">
              <p className="text-gray-500 text-sm">Trusted by</p>
              <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-40">
                <span className="text-white text-lg font-semibold tracking-tight">Stripe</span>
                <span className="text-white text-lg font-semibold tracking-tight">Visa</span>
                <span className="text-white text-lg font-semibold tracking-tight">Mastercard</span>
                <span className="text-white text-lg font-semibold tracking-tight">PayPal</span>
                <span className="text-white text-lg font-semibold tracking-tight">Apple Pay</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Powerful tools to help you understand and manage your money better.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Expense Tracking", description: "Monitor all your transactions in one place with automatic categorization." },
              { icon: PieChart, title: "Visual Reports", description: "Beautiful charts that make understanding your finances simple." },
              { icon: Wallet, title: "Budget Planning", description: "Set spending limits for categories and track your progress." },
              { icon: Receipt, title: "Receipt Scanning", description: "Snap a photo and we extract the details automatically." },
              { icon: BarChart3, title: "Analytics", description: "Deep insights into your spending patterns over time." },
              { icon: Target, title: "Financial Goals", description: "Set savings targets and watch your progress grow." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl transition-all duration-300"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)' }}
                >
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Get started in minutes with three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", description: "Sign up and set your financial preferences and goals." },
              { step: "02", title: "Add Expenses", description: "Log your transactions manually or scan receipts." },
              { step: "03", title: "Track Progress", description: "Watch your spending patterns and reach your goals." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-6xl font-bold gradient-text mb-6">{item.step}</div>
                <h3 className="text-2xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Understand Your
                <br />
                <span className="gradient-text">Spending Habits</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Get detailed breakdowns of where your money goes. Our analytics help you identify areas to save and make smarter financial decisions.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium group"
              >
                Start Tracking
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8"
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Mock Chart */}
              <div className="space-y-6">
                {[
                  { label: "Food & Dining", percentage: 35, color: "#10b981" },
                  { label: "Transportation", percentage: 25, color: "#f59e0b" },
                  { label: "Entertainment", percentage: 20, color: "#84cc16" },
                  { label: "Shopping", percentage: 15, color: "#06b6d4" },
                  { label: "Other", percentage: 5, color: "#8b5cf6" },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-gray-500">{item.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join BudgetBuddy and start managing your finances the smart way.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all duration-300 hover:scale-105"
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
              }}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              >
                B
              </div>
              <span className="text-xl font-bold text-white">BudgetBuddy</span>
            </div>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-600 text-sm">
              BudgetBuddy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
