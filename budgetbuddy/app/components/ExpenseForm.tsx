"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { motion } from "framer-motion";
import { X, DollarSign, FileText, Tag, Calendar, RefreshCcw } from "lucide-react";

interface ExpenseFormProps {
  onClose: () => void;
}

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
  const { categories, addExpense } = useExpenses();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: categories[0]?.name || "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurringFrequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
    });
    onClose();
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="glass-card p-8 w-full max-w-md relative"
        style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          >
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Add New Expense</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="modern-input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="modern-input"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="modern-input"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="modern-input"
            />
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <label htmlFor="isRecurring" className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <RefreshCcw className="w-4 h-4 text-amber-400" />
              Recurring Expense
            </label>
          </div>
          {formData.isRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <RefreshCcw className="w-4 h-4 text-emerald-400" />
                Frequency
              </label>
              <select
                value={formData.recurringFrequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurringFrequency: e.target.value as "daily" | "weekly" | "monthly" | "yearly",
                  })
                }
                className="modern-input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </motion.div>
          )}
          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl font-medium text-gray-300 transition-all"
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="flex-1 px-5 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              Add Expense
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

