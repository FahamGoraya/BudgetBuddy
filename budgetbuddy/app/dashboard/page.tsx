"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Target, 
  Home, 
  PiggyBank, 
  PartyPopper, 
  BarChart3, 
  Bot, 
  DollarSign, 
  TrendingUp,
  TrendingDown, 
  Calendar, 
  Sparkles,
  ArrowUpRight,
  Zap,
  Shield,
  ChevronRight,
  Clock,
  Wallet
} from "lucide-react";

interface FinancialPlan {
  id: string;
  userId: string;
  goal: string;
  monthlyIncome: number;
  currency: string;
  structuredPlan: string;
  essentialExpenses: number;
  essentialExpensesPurpose: string;
  savings: number;
  savingsPurpose: string;
  discretionarySpending: number;
  discretionarySpendingPurpose: string;
  createdAt: string;
  updatedAt: string;
}

// Animated counter component
const AnimatedCounter = ({ value, prefix = "", suffix = "", duration = 2 }: { value: number; prefix?: string; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const incrementTime = (duration * 1000) / end;
      const step = Math.max(1, Math.floor(end / 100));
      
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime * step);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);
  
  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </span>
  );
};

// Stagger container animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [hasPlan, setHasPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialPlan();
  }, []);

  const fetchFinancialPlan = async () => {
    try {
      const response = await fetchWithAuth('/api/financial-plan');
      const data = await response.json();
      
      if (data.success && data.hasPlan) {
        setFinancialPlan(data.plan);
        setHasPlan(true);
      } else {
        setHasPlan(false);
      }
    } catch (error) {
      console.error('Error fetching financial plan:', error);
      setHasPlan(false);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? "Good Morning" : currentDate.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate percentages
  const monthlyIncome = financialPlan?.monthlyIncome || 0;
  const essentialExpenses = financialPlan?.essentialExpenses || 0;
  const savings = financialPlan?.savings || 0;
  const discretionarySpending = financialPlan?.discretionarySpending || 0;
  
  const essentialPercentage = monthlyIncome > 0 ? (essentialExpenses / monthlyIncome) * 100 : 0;
  const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const discretionaryPercentage = monthlyIncome > 0 ? (discretionarySpending / monthlyIncome) * 100 : 0;
  const totalAllocated = essentialExpenses + savings + discretionarySpending;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹'
    };
    return symbols[currency] || currency;
  };

  const currencySymbol = getCurrencySymbol(financialPlan?.currency || 'USD');

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <motion.div 
              className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <p className="text-white text-lg font-medium">Loading your dashboard</p>
            <p className="text-gray-500 text-sm">Preparing your financial insights...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // No Plan State
  if (!hasPlan || !financialPlan) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          className="text-center space-y-8 max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="relative mx-auto w-40 h-40"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-3xl blur-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(245, 158, 11, 0.4) 100%)' }}
            />
            <div className="relative w-full h-full rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
            >
              <BarChart3 className="w-20 h-20 text-white" />
            </div>
          </motion.div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white">Start Your Journey</h2>
            <p className="text-gray-400 text-lg">Create your personalized AI-powered financial plan to unlock your dashboard.</p>
          </div>
          
          <motion.button 
            onClick={() => router.push('/onboarding')}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-5 h-5" />
            Create Your Plan
            <ArrowUpRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-3"
            style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300">{greeting}</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || "User"}</span>
          </h1>
          <p className="text-gray-400 text-lg">Here&apos;s your financial overview for {currentMonth}</p>
        </div>
        
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-card px-5 py-3 flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Last updated: {formatDate(financialPlan.updatedAt)}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Financial Goal Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(132, 204, 22, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-5">
            <motion.div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Target className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-emerald-300 mb-1 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Your Financial Goal
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{financialPlan.goal}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Monthly Income</p>
              <p className="text-3xl md:text-4xl font-bold text-white">{currencySymbol}<AnimatedCounter value={monthlyIncome} /></p>
            </div>
            <motion.button
              className="p-3 rounded-xl"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              whileHover={{ scale: 1.1, background: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: "Total Income", 
            value: monthlyIncome, 
            icon: DollarSign, 
            color: "from-emerald-500 to-teal-600",
            bgColor: "rgba(16, 185, 129, 0.1)",
            borderColor: "rgba(16, 185, 129, 0.2)",
            trend: "+12.5%",
            trendUp: true
          },
          { 
            label: "Total Allocated", 
            value: totalAllocated, 
            icon: Wallet, 
            color: "from-violet-500 to-purple-600",
            bgColor: "rgba(139, 92, 246, 0.1)",
            borderColor: "rgba(139, 92, 246, 0.2)",
            trend: "98.2%",
            trendUp: true
          },
          { 
            label: "Monthly Savings", 
            value: savings, 
            icon: PiggyBank, 
            color: "from-cyan-500 to-blue-600",
            bgColor: "rgba(6, 182, 212, 0.1)",
            borderColor: "rgba(6, 182, 212, 0.2)",
            trend: "+8.3%",
            trendUp: true
          },
          { 
            label: "Essential Expenses", 
            value: essentialExpenses, 
            icon: Home, 
            color: "from-orange-500 to-amber-600",
            bgColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 0.2)",
            trend: "-3.2%",
            trendUp: false
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card glass-card p-6"
            style={{ background: stat.bgColor, borderColor: stat.borderColor }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{currencySymbol}<AnimatedCounter value={stat.value} duration={1.5} /></p>
          </motion.div>
        ))}
      </motion.div>

      {/* Budget Allocation Section */}
      <motion.div variants={itemVariants} className="glass-card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          >
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Budget Allocation</h2>
            <p className="text-gray-400 text-sm">How your income is distributed across categories</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-1 h-14 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <motion.div 
              className="flex items-center justify-center text-white font-bold transition-all cursor-pointer relative group"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${essentialPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              whileHover={{ filter: 'brightness(1.1)' }}
            >
              {essentialPercentage > 15 && <span className="text-sm">{essentialPercentage.toFixed(0)}%</span>}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                Essential: {currencySymbol}{essentialExpenses.toLocaleString()}
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center text-white font-bold transition-all cursor-pointer relative group"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${savingsPercentage}%` }}
              transition={{ duration: 1, delay: 0.7 }}
              whileHover={{ filter: 'brightness(1.1)' }}
            >
              {savingsPercentage > 15 && <span className="text-sm">{savingsPercentage.toFixed(0)}%</span>}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                Savings: {currencySymbol}{savings.toLocaleString()}
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center text-white font-bold transition-all cursor-pointer relative group"
              style={{ background: 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${discretionaryPercentage}%` }}
              transition={{ duration: 1, delay: 0.9 }}
              whileHover={{ filter: 'brightness(1.1)' }}
            >
              {discretionaryPercentage > 15 && <span className="text-sm">{discretionaryPercentage.toFixed(0)}%</span>}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                Discretionary: {currencySymbol}{discretionarySpending.toLocaleString()}
              </div>
            </motion.div>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            {[
              { label: "Essential", percentage: essentialPercentage, color: "#10b981" },
              { label: "Savings", percentage: savingsPercentage, color: "#f59e0b" },
              { label: "Discretionary", percentage: discretionaryPercentage, color: "#84cc16" }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-sm text-gray-400">{item.label} ({item.percentage.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Essential Expenses",
              amount: essentialExpenses,
              percentage: essentialPercentage,
              purpose: financialPlan.essentialExpensesPurpose,
              icon: Home,
              gradient: "from-emerald-600 to-teal-700",
              glowColor: "rgba(16, 185, 129, 0.3)"
            },
            {
              title: "Savings",
              amount: savings,
              percentage: savingsPercentage,
              purpose: financialPlan.savingsPurpose,
              icon: PiggyBank,
              gradient: "from-amber-600 to-orange-700",
              glowColor: "rgba(245, 158, 11, 0.3)"
            },
            {
              title: "Discretionary",
              amount: discretionarySpending,
              percentage: discretionaryPercentage,
              purpose: financialPlan.discretionarySpendingPurpose,
              icon: PartyPopper,
              gradient: "from-lime-600 to-green-700",
              glowColor: "rgba(132, 204, 22, 0.3)"
            }
          ].map((card, index) => (
            <motion.div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.gradient}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{ boxShadow: `0 20px 40px -10px ${card.glowColor}` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm text-white">
                    {card.percentage.toFixed(1)}%
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white/80 mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-white mb-4">
                  {currencySymbol}{card.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-white/60 mb-1">Purpose</p>
                  <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{card.purpose}</p>
                </div>
                
                <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${card.percentage}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + (0.2 * index) }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Strategy Section */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(132, 204, 22, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4 mb-8">
            <motion.div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(16, 185, 129, 0.3)',
                  '0 0 40px rgba(16, 185, 129, 0.5)',
                  '0 0 20px rgba(16, 185, 129, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white">AI Financial Strategy</h2>
              <p className="text-gray-400 mt-1">Personalized plan based on your goals and income</p>
            </div>
          </div>
          
          <div className="glass-card p-6 md:p-8">
            <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">{financialPlan.structuredPlan}</p>
          </div>
        </div>
      </motion.div>

      {/* Plan Metadata */}
      <motion.div 
        variants={itemVariants}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
          >
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Plan Details</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Plan ID", value: financialPlan.id.slice(0, 8) + '...' },
            { label: "Currency", value: financialPlan.currency },
            { label: "Created", value: formatDate(financialPlan.createdAt) },
            { label: "Updated", value: formatDate(financialPlan.updatedAt) }
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className="text-white font-medium text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
