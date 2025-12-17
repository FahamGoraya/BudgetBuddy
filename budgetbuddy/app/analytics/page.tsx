"use client";

import { useExpenses } from "../context/ExpenseContext";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import BudgetProgressChart from "../components/charts/BudgetProgressChart";
import SpendingTrendChart from "../components/charts/SpendingTrendChart";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Average Expense</p>
          <p className="text-2xl font-bold text-gray-900">${averageExpense.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Top Category</p>
          <p className="text-2xl font-bold text-gray-900">{highestCategory.name}</p>
          <p className="text-sm text-gray-400">${highestCategory.value.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Over Budget</p>
          <p className={`text-2xl font-bold ${overBudgetCategories.length > 0 ? "text-red-600" : "text-green-600"}`}>
            {overBudgetCategories.length} categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpensePieChart />
        <MonthlyBarChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart />
        <BudgetProgressChart />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categoryData.map((cat) => {
                const budget = budgets.find((b) => b.category === cat.name);
                const isOverBudget = budget && budget.spent > budget.limit;
                const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;

                return (
                  <tr key={cat.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      ${cat.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {budget ? (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isOverBudget
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isOverBudget ? "Over Budget" : "On Track"}
                        </span>
                      ) : (
                        <span className="text-gray-400">No budget</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

