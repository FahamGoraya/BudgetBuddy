"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Target,
  DollarSign,
  Calendar,
  Home,
  PiggyBank,
  PartyPopper,
  Trash2,
  RefreshCcw,
  AlertTriangle,
  ChevronRight,
  Clock,
  History,
  Shield
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

interface MonthOption {
  label: string;
  year: number;
  month: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [hasPlan, setHasPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthOption | null>(null);
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchFinancialPlan();
    generateMonthOptions();
  }, [isAuthenticated, router]);

  const generateMonthOptions = () => {
    const options: MonthOption[] = [];
    const now = new Date();
    
    // Generate last 12 months including current
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
    
    setMonthOptions(options);
    setSelectedMonth(options[0]); // Current month by default
  };

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

  const handleDeletePlan = async () => {
    setDeleting(true);
    try {
      const response = await fetchWithAuth('/api/financial-plan', {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setFinancialPlan(null);
        setHasPlan(false);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting financial plan:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateNewPlan = () => {
    router.push('/onboarding');
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹'
    };
    return symbols[currency] || currency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Loading settings...</p>
        </motion.div>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(financialPlan?.currency || 'USD');
  const monthlyIncome = financialPlan?.monthlyIncome || 0;
  const essentialExpenses = financialPlan?.essentialExpenses || 0;
  const savings = financialPlan?.savings || 0;
  const discretionarySpending = financialPlan?.discretionarySpending || 0;

  return (
    <motion.div 
      className="space-y-6 md:space-y-8 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage your financial plan and preferences</p>
      </div>

      {/* Financial Plan Section */}
      <motion.div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute top-0 right-0 w-48 md:w-72 h-48 md:h-72 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #8b5cf6 100%)' }}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Financial Plan</h2>
              <p className="text-sm text-gray-400">Your AI-generated budget strategy</p>
            </div>
          </div>

          {hasPlan && financialPlan ? (
            <div className="space-y-6">
              {/* Plan Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-gray-400">Your Goal</span>
                  </div>
                  <p className="text-white font-medium">{financialPlan.goal}</p>
                </div>
                
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-gray-400">Monthly Income</span>
                  </div>
                  <p className="text-white font-bold text-xl">
                    {currencySymbol}{monthlyIncome.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-white">Essential</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {currencySymbol}{essentialExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{financialPlan.essentialExpensesPurpose}</p>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(essentialExpenses / monthlyIncome) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <PiggyBank className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-white">Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {currencySymbol}{savings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{financialPlan.savingsPurpose}</p>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(savings / monthlyIncome) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <PartyPopper className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-white">Discretionary</span>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {currencySymbol}{discretionarySpending.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{financialPlan.discretionarySpendingPurpose}</p>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(discretionarySpending / monthlyIncome) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Plan Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(financialPlan.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {formatDate(financialPlan.updatedAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                <motion.button
                  onClick={handleCreateNewPlan}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCcw className="w-5 h-5" />
                  Create New Plan
                </motion.button>
                
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-red-400"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                  whileHover={{ scale: 1.02, background: 'rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Plan
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)' }}>
                <Target className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Financial Plan Yet</h3>
              <p className="text-gray-400 mb-6">Create an AI-powered financial plan to start tracking your budget</p>
              <motion.button
                onClick={handleCreateNewPlan}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                Create Your Plan
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Expense History Section */}
      <motion.div
        className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8"
        style={{
          background: 'rgba(18, 18, 26, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}>
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Expense History</h2>
            <p className="text-sm text-gray-400">View expenses from previous months</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Month</label>
            <select
              value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : ''}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-').map(Number);
                const option = monthOptions.find(o => o.year === year && o.month === month);
                setSelectedMonth(option || null);
              }}
              className="w-full md:w-64 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors"
            >
              {monthOptions.map((option) => (
                <option 
                  key={`${option.year}-${option.month}`} 
                  value={`${option.year}-${option.month}`}
                  className="bg-gray-900"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            onClick={() => {
              if (selectedMonth) {
                router.push(`/expenses?year=${selectedMonth.year}&month=${selectedMonth.month}`);
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white"
            style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
            whileHover={{ scale: 1.02, background: 'rgba(139, 92, 246, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            <History className="w-4 h-4" />
            View Historical Expenses
          </motion.button>
        </div>

        <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <p className="text-sm text-gray-300">
            <strong className="text-purple-300">💡 How it works:</strong> Expenses are automatically organized by month. 
            Your budgets reset at the start of each new month, and previous month&apos;s expenses are preserved for historical analysis.
          </p>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-md p-6 rounded-2xl"
              style={{ background: 'rgba(18, 18, 26, 0.98)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Financial Plan?</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your financial plan? Your expenses and budgets will be preserved, 
                but you&apos;ll need to create a new plan to continue tracking your financial goals.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-300 transition-colors"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleDeletePlan}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-500 disabled:opacity-50"
                  whileHover={{ scale: deleting ? 1 : 1.02 }}
                  whileTap={{ scale: deleting ? 1 : 0.98 }}
                >
                  {deleting ? 'Deleting...' : 'Delete Plan'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
