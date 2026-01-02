"use client";

import { useExpenses } from "../../context/ExpenseContext";
import { Target, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function BudgetProgressChart() {
  const { budgets, categories } = useExpenses();

  if (budgets.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Budget Progress</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No budget data available
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Target className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Budget Progress</h3>
      </div>
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {budgets.map((budget, index) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const category = categories.find((c) => c.name === budget.category);
          const isOverBudget = budget.spent > budget.limit;

          return (
            <motion.div 
              key={budget.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl" 
              style={{ background: 'rgba(255, 255, 255, 0.02)' }}
            >
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium text-white flex items-center gap-2">
                  {budget.category}
                  {isOverBudget && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                </span>
                <span className={isOverBudget ? "text-rose-400 font-medium" : "text-gray-400"}>
                  ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isOverBudget 
                      ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                      : `linear-gradient(90deg, ${category?.color || '#10b981'}, ${category?.color || '#10b981'}aa)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
