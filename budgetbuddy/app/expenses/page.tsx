"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import ExpenseForm from "../components/ExpenseForm";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Trash2, Receipt, ArrowUpDown, Calendar, Tag, DollarSign, RefreshCcw } from "lucide-react";

export default function ExpensesPage() {
  const { expenses, deleteExpense, categories } = useExpenses();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredExpenses = expenses
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Expenses</h1>
          <p className="text-gray-400">Track and manage your spending</p>
        </div>
        <motion.button
          onClick={() => setShowExpenseForm(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(139, 92, 246, 0.5)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </motion.button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          className="glass-card p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-white">{filteredExpenses.length}</p>
          </div>
        </motion.div>
        <motion.div 
          className="glass-card p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</p>
          </div>
        </motion.div>
        <motion.div 
          className="glass-card p-5 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Categories Used</p>
            <p className="text-2xl font-bold text-white">{new Set(filteredExpenses.map(e => e.category)).size}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div 
        className="glass-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="modern-input min-w-[180px]"
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
              className="modern-input min-w-[140px]"
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
              className="modern-input min-w-[140px]"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Expenses Table */}
      <motion.div 
        className="glass-card overflow-hidden"
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

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
    </motion.div>
  );
}

