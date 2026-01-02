"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import ExpenseForm from "../components/ExpenseForm";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Plus, Calendar, DollarSign, Trash2, TrendingUp } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function RecurringPage() {
  const { getRecurringExpenses, deleteExpense } = useExpenses();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const recurringExpenses = getRecurringExpenses();
  const totalMonthly = recurringExpenses
    .filter((e) => e.recurringFrequency === "monthly")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalYearly = recurringExpenses
    .filter((e) => e.recurringFrequency === "yearly")
    .reduce((sum, e) => sum + e.amount, 0);

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency;
    }
  };

  const getAnnualCost = (amount: number, frequency: string) => {
    switch (frequency) {
      case "daily":
        return amount * 365;
      case "weekly":
        return amount * 52;
      case "monthly":
        return amount * 12;
      case "yearly":
        return amount;
      default:
        return amount;
    }
  };

  const totalAnnualCost = recurringExpenses.reduce(
    (sum, e) => sum + getAnnualCost(e.amount, e.recurringFrequency || "monthly"),
    0
  );

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)' }}
          >
            <RefreshCcw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Recurring Expenses</h1>
            <p className="text-gray-400 text-sm">Manage your subscriptions and recurring payments</p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowExpenseForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Recurring Expense
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-gray-400">Monthly Subscriptions</p>
          </div>
          <p className="text-2xl font-bold text-white">${totalMonthly.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">per month</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-amber-400" />
            <p className="text-sm text-gray-400">Yearly Subscriptions</p>
          </div>
          <p className="text-2xl font-bold text-white">${totalYearly.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">per year</p>
        </div>
        <div className="glass-card p-6" style={{ borderColor: 'rgba(236, 72, 153, 0.3)' }}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-lime-400" />
            <p className="text-sm text-gray-400">Total Annual Cost</p>
          </div>
          <p className="text-2xl font-bold gradient-text">${totalAnnualCost.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">{recurringExpenses.length} subscriptions</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Annual Cost
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {recurringExpenses.map((expense, index) => (
                <motion.tr 
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-white">{expense.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-default">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-purple">
                      {getFrequencyLabel(expense.recurringFrequency || "monthly")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    ${getAnnualCost(expense.amount, expense.recurringFrequency || "monthly").toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
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
        {recurringExpenses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <RefreshCcw className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No recurring expenses found</p>
            <p className="text-sm mt-1 text-gray-600">Add your first subscription to get started</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

