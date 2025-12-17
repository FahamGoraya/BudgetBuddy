"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import BudgetForm from "../components/BudgetForm";

export default function BudgetsPage() {
  const { budgets, deleteBudget, categories } = useExpenses();
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setShowBudgetForm(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${(totalBudget - totalSpent).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const category = categories.find((c) => c.name === budget.category);
          const isOverBudget = budget.spent > budget.limit;

          return (
            <div key={budget.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                  <p className="text-sm text-gray-500">Monthly Budget</p>
                </div>
                <button
                  onClick={() => deleteBudget(budget.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  X
                </button>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Spent</span>
                  <span className={isOverBudget ? "text-red-600 font-semibold" : ""}>
                    ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isOverBudget ? "#EF4444" : category?.color || "#6366F1",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className={isOverBudget ? "text-red-600" : "text-green-600"}>
                  ${(budget.limit - budget.spent).toFixed(2)}
                </span>
              </div>
              {isOverBudget && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">Over budget by ${(budget.spent - budget.limit).toFixed(2)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-500">No budgets created yet. Add a budget to start tracking.</p>
        </div>
      )}

      {showBudgetForm && <BudgetForm onClose={() => setShowBudgetForm(false)} />}
    </div>
  );
}

