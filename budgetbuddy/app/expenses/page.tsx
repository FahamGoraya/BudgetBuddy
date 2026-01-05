"use client";

import { useState, useEffect } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { useSearchParams, useRouter } from "next/navigation";
import ExpenseForm from "../components/ExpenseForm";
import ReceiptScanner from "../components/ReceiptScanner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Trash2, Receipt, ArrowUpDown, Calendar, Tag, DollarSign, RefreshCcw, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchWithAuth } from "../lib/auth";
import { Expense } from "../types";

interface ScannedReceiptData {
  merchantName: string;
  date: string;
  total: number;
  category: string;
}

interface MonthOption {
  label: string;
  year: number;
  month: number;
}

export default function ExpensesPage() {
  const { expenses, deleteExpense, categories, refreshExpenses } = useExpenses();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Month selection
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<MonthOption | null>(null);
  const [historicalExpenses, setHistoricalExpenses] = useState<Expense[]>([]);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [viewingHistory, setViewingHistory] = useState(false);

  // Generate month options for the last 12 months
  const getMonthOptions = (): MonthOption[] => {
    const options: MonthOption[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        month: date.getMonth()
      });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  // Check for URL params on mount
  useEffect(() => {
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam);
      const option = monthOptions.find(o => o.year === year && o.month === month);
      
      if (option) {
        // Check if it's the current month
        const now = new Date();
        if (year === now.getFullYear() && month === now.getMonth()) {
          setViewingHistory(false);
          refreshExpenses();
        } else {
          setSelectedMonth(option);
          setViewingHistory(true);
          fetchHistoricalExpenses(year, month);
        }
      }
    } else {
      // No params, show current month
      refreshExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchHistoricalExpenses = async (year: number, month: number) => {
    setLoadingHistorical(true);
    try {
      const response = await fetchWithAuth(`/api/expenses?year=${year}&month=${month}`);
      const data = await response.json();
      
      const transformedExpenses: Expense[] = data.map((exp: {
        id: string;
        amount: number;
        description: string;
        category: string;
        date: string;
        recurring: boolean;
        recurringFrequency?: string;
      }) => ({
        id: exp.id,
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: new Date(exp.date).toISOString().split('T')[0],
        isRecurring: exp.recurring,
        recurringFrequency: exp.recurringFrequency,
      }));
      
      setHistoricalExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching historical expenses:', error);
    } finally {
      setLoadingHistorical(false);
    }
  };

  const handleMonthChange = (year: number, month: number) => {
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    
    if (isCurrentMonth) {
      setViewingHistory(false);
      setSelectedMonth(null);
      router.push('/expenses');
      refreshExpenses();
    } else {
      const option = monthOptions.find(o => o.year === year && o.month === month);
      setSelectedMonth(option || null);
      setViewingHistory(true);
      router.push(`/expenses?year=${year}&month=${month}`);
      fetchHistoricalExpenses(year, month);
    }
  };

  const handleBackToCurrent = () => {
    setViewingHistory(false);
    setSelectedMonth(null);
    router.push('/expenses');
    refreshExpenses();
  };

  const handleReceiptScanned = (data: ScannedReceiptData) => {
    setScannedData(data);
    setShowReceiptScanner(false);
    setShowExpenseForm(true);
  };

  const handleExpenseAdded = () => {
    setShowExpenseForm(false);
    setScannedData(null);
  }

  // Use either historical or current expenses
  const displayExpenses = viewingHistory ? historicalExpenses : expenses;

  const filteredExpenses = displayExpenses
    .filter((expense) => !filterCategory || expense.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      } else {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {viewingHistory ? 'Expense History' : 'Expenses'}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              {viewingHistory 
                ? `Viewing ${selectedMonth?.label}` 
                : 'Track and manage your spending'}
            </p>
          </div>
          
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            {viewingHistory && (
              <motion.button
                onClick={handleBackToCurrent}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400"
                style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Current Month
              </motion.button>
            )}
            <select
              value={selectedMonth ? `${selectedMonth.year}-${selectedMonth.month}` : 'current'}
              onChange={(e) => {
                if (e.target.value === 'current') {
                  handleBackToCurrent();
                } else {
                  const [year, month] = e.target.value.split('-').map(Number);
                  handleMonthChange(year, month);
                }
              }}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="current" className="bg-gray-900">Current Month</option>
              {monthOptions.slice(1).map((option) => (
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
        </div>
        
        {!viewingHistory && (
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => setShowReceiptScanner(true)}
              className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Camera className="w-5 h-5" />
              Scan Receipt
            </motion.button>
            <motion.button
              onClick={() => {
                setScannedData(null);
                setShowExpenseForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 md:px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </motion.button>
          </div>
        )}

        {viewingHistory && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <p className="text-sm text-purple-300">
              📅 You are viewing historical expenses. To add new expenses, return to the current month.
            </p>
          </div>
        )}
      </div>

      {/* Loading state for historical data */}
      {loadingHistorical && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading expenses...</p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <motion.div 
          className="glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0">
            <Receipt className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-xs md:text-sm">Total Expenses</p>
            <p className="text-xl md:text-2xl font-bold text-white">{filteredExpenses.length}</p>
          </div>
        </motion.div>
        <motion.div 
          className="glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0">
            <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-xs md:text-sm">Total Amount</p>
            <p className="text-xl md:text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
          </div>
        </motion.div>
        <motion.div 
          className="glass-card p-4 md:p-5 flex items-center gap-3 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
            <Tag className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-xs md:text-sm">Categories Used</p>
            <p className="text-xl md:text-2xl font-bold text-white">{new Set(filteredExpenses.map(e => e.category)).size}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        className="glass-card p-4 md:p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="modern-input w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              className="modern-input w-full"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="modern-input w-full"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {filteredExpenses.map((expense, index) => (
            <motion.div 
              key={expense.id}
              className="glass-card p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{expense.description}</p>
                  <p className="text-gray-400 text-sm">{expense.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-lg">${expense.amount.toFixed(2)}</span>
                  <motion.button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge text-xs">{expense.category}</span>
                {expense.isRecurring && (
                  <span className="badge-success flex items-center gap-1 text-xs">
                    <RefreshCcw className="w-3 h-3" />
                    {expense.recurringFrequency}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No expenses found</p>
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <motion.div 
        className="glass-card overflow-hidden hidden md:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredExpenses.map((expense, index) => (
                  <motion.tr 
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>
                      <span className="font-medium text-white">{expense.description}</span>
                    </td>
                    <td>
                      <span className="badge">{expense.category}</span>
                    </td>
                    <td className="text-gray-400">{expense.date}</td>
                    <td className="font-semibold text-white">${expense.amount.toFixed(2)}</td>
                    <td>
                      {expense.isRecurring ? (
                        <span className="badge-success flex items-center gap-1 w-fit">
                          <RefreshCcw className="w-3 h-3" />
                          {expense.recurringFrequency}
                        </span>
                      ) : (
                        <span className="text-gray-500">One-time</span>
                      )}
                    </td>
                    <td>
                      <motion.button
                        onClick={() => deleteExpense(expense.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredExpenses.length === 0 && (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No expenses found</p>
            <p className="text-gray-500 text-sm">Start by adding your first expense</p>
          </div>
        )}
      </motion.div>

      {showExpenseForm && (
        <ExpenseForm 
          onClose={() => {
            setShowExpenseForm(false);
            setScannedData(null);
          }}
          initialData={scannedData ? {
            amount: scannedData.total.toString(),
            description: scannedData.merchantName,
            category: scannedData.category,
            date: scannedData.date,
          } : undefined}
        />
      )}

      {showReceiptScanner && (
        <ReceiptScanner
          onReceiptScanned={handleReceiptScanned}
          onClose={() => setShowReceiptScanner(false)}
        />
      )}
    </motion.div>
  );
}

