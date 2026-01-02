"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import BudgetForm from "../components/BudgetForm";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Wallet, TrendingUp, TrendingDown, AlertTriangle, X, PiggyBank, Target, DollarSign } from "lucide-react";

export default function BudgetsPage() {
  const { budgets, deleteBudget, categories } = useExpenses();
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Budgets</h1>
          <p className="text-gray-400">Set spending limits for each category</p>
        </div>
        <motion.button
          onClick={() => setShowBudgetForm(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Budget
        </motion.button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
              <Target className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Total Budget</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalBudget.toFixed(2)}</p>
        </motion.div>
        
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.2)' }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Total Spent</p>
          </div>
          <p className="text-3xl font-bold text-white">${totalSpent.toFixed(2)}</p>
        </motion.div>
        
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ 
            background: remaining >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            borderColor: remaining >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' 
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${remaining >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'}`}>
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-400 text-sm">Remaining</p>
          </div>
          <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${remaining.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {budgets.map((budget, index) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const category = categories.find((c) => c.name === budget.category);
            const isOverBudget = budget.spent > budget.limit;
            const remainingBudget = budget.limit - budget.spent;

            return (
              <motion.div 
                key={budget.id} 
                className="glass-card p-6 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Gradient overlay for over budget */}
                {isOverBudget && (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${category?.color || '#10b981'}25` }}
                      >
                        <Wallet className="w-5 h-5" style={{ color: category?.color || '#10b981' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{budget.category}</h3>
                        <p className="text-xs text-gray-500">Monthly Budget</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => deleteBudget(budget.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Spent</span>
                      <span className={isOverBudget ? "text-rose-400 font-semibold" : "text-white"}>
                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isOverBudget 
                            ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                            : `linear-gradient(90deg, ${category?.color || '#10b981'}, ${category?.color || '#10b981'}dd)`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Remaining</span>
                    <span className={`font-semibold ${isOverBudget ? "text-rose-400" : "text-emerald-400"}`}>
                      ${remainingBudget.toFixed(2)}
                    </span>
                  </div>
                  
                  {isOverBudget && (
                    <motion.div 
                      className="mt-4 p-3 rounded-xl flex items-center gap-2"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <p className="text-xs text-rose-300">Over budget by ${(budget.spent - budget.limit).toFixed(2)}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {budgets.length === 0 && (
        <motion.div 
          className="glass-card p-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No budgets created yet</p>
          <p className="text-gray-500 text-sm">Add a budget to start tracking your spending limits</p>
        </motion.div>
      )}

      {showBudgetForm && <BudgetForm onClose={() => setShowBudgetForm(false)} />}
    </motion.div>
  );
}
