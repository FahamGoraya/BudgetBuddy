"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { motion } from "framer-motion";
import { X, Wallet, Target, Tag, DollarSign } from "lucide-react";

interface BudgetFormProps {
  onClose: () => void;
}

export default function BudgetForm({ onClose }: BudgetFormProps) {
  const { categories, addBudget, budgets } = useExpenses();
  const existingCategories = budgets.map((b) => b.category);
  const availableCategories = categories.filter((c) => !existingCategories.includes(c.name));

  const [formData, setFormData] = useState({
    category: availableCategories[0]?.name || "",
    limit: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget({
      category: formData.category,
      limit: parseFloat(formData.limit),
      spent: 0,
    });
    onClose();
  };

  if (availableCategories.length === 0) {
    return (
      <motion.div 
        className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      >
        <motion.div 
          className="glass-card p-6 md:p-8 w-full sm:max-w-md text-center rounded-t-3xl sm:rounded-3xl"
          style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          initial={{ scale: 0.9, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile handle */}
          <div className="sm:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
          
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          >
            <Wallet className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">All Set!</h2>
          <p className="text-gray-400 mb-6 text-sm md:text-base">All categories already have budgets assigned.</p>
          <motion.button
            onClick={onClose}
            className="w-full px-5 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div 
        className="glass-card p-5 md:p-8 w-full sm:max-w-md relative rounded-t-3xl sm:rounded-3xl"
        style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
        initial={{ scale: 0.9, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-5 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          >
            <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Add New Budget</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
              {availableCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Monthly Limit
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="modern-input"
              placeholder="0.00"
            />
          </div>
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
              Add Budget
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

