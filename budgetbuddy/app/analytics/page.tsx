"use client";

import { useExpenses } from "../context/ExpenseContext";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import BudgetProgressChart from "../components/charts/BudgetProgressChart";
import SpendingTrendChart from "../components/charts/SpendingTrendChart";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertTriangle, Receipt, PieChart, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { expenses, budgets, getExpensesByCategory, getTotalExpenses } = useExpenses();

  const categoryData = getExpensesByCategory();
  const totalExpenses = getTotalExpenses();
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const highestCategory = categoryData.reduce(
    (max, cat) => (cat.value > max.value ? cat : max),
    { name: "N/A", value: 0, color: "" }
  );

  const overBudgetCategories = budgets.filter((b) => b.spent > b.limit);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-gray-400">Deep insights into your spending patterns</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: "Total Transactions", 
            value: expenses.length.toString(),
            icon: Receipt,
            color: "from-violet-500 to-purple-600",
            bgColor: "rgba(139, 92, 246, 0.1)"
          },
          { 
            label: "Average Expense", 
            value: `$${averageExpense.toFixed(2)}`,
            icon: TrendingUp,
            color: "from-cyan-500 to-blue-600",
            bgColor: "rgba(6, 182, 212, 0.1)"
          },
          { 
            label: "Top Category", 
            value: highestCategory.name,
            subValue: `$${highestCategory.value.toFixed(2)}`,
            icon: PieChart,
            color: "from-emerald-500 to-teal-600",
            bgColor: "rgba(16, 185, 129, 0.1)"
          },
          { 
            label: "Over Budget", 
            value: `${overBudgetCategories.length} categories`,
            icon: AlertTriangle,
            color: overBudgetCategories.length > 0 ? "from-red-500 to-rose-600" : "from-emerald-500 to-teal-600",
            bgColor: overBudgetCategories.length > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
            isWarning: overBudgetCategories.length > 0
          }
        ].map((stat, index) => (
          <motion.div 
            key={stat.label}
            className="glass-card p-6"
            style={{ background: stat.bgColor }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.isWarning ? 'text-rose-400' : 'text-white'}`}>{stat.value}</p>
            {stat.subValue && <p className="text-gray-500 text-sm">{stat.subValue}</p>}
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ExpensePieChart />
        </motion.div>
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MonthlyBarChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SpendingTrendChart />
        </motion.div>
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <BudgetProgressChart />
        </motion.div>
      </div>

      {/* Category Breakdown Table */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Category Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Percentage</th>
                <th>Budget Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((cat) => {
                const budget = budgets.find((b) => b.category === cat.name);
                const isOverBudget = budget && budget.spent > budget.limit;
                const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;

                return (
                  <tr key={cat.name}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-white">
                      ${cat.value.toFixed(2)}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                          <div 
                            className="h-full rounded-full"
                            style={{ width: `${percentage}%`, background: cat.color }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      {budget ? (
                        <span className={isOverBudget ? "badge-danger" : "badge-success"}>
                          {isOverBudget ? "Over Budget" : "On Track"}
                        </span>
                      ) : (
                        <span className="text-gray-500">No budget</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

