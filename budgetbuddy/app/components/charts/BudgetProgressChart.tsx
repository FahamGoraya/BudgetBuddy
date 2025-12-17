"use client";

import { useExpenses } from "../../context/ExpenseContext";

export default function BudgetProgressChart() {
  const { budgets, categories } = useExpenses();

  if (budgets.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Budget Progress</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No budget data available
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Budget Progress</h3>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {budgets.map((budget) => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
          const category = categories.find((c) => c.name === budget.category);
          const isOverBudget = budget.spent > budget.limit;

          return (
            <div key={budget.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{budget.category}</span>
                <span className={isOverBudget ? "text-red-600" : "text-gray-600"}>
                  ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isOverBudget ? "#EF4444" : category?.color || "#6366F1",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
