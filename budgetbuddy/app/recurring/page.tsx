"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import ExpenseForm from "../components/ExpenseForm";

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>
        <button
          onClick={() => setShowExpenseForm(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Add Recurring Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Monthly Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">${totalMonthly.toFixed(2)}</p>
          <p className="text-sm text-gray-400">per month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Yearly Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">${totalYearly.toFixed(2)}</p>
          <p className="text-sm text-gray-400">per year</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Annual Cost</p>
          <p className="text-2xl font-bold text-teal-600">${totalAnnualCost.toFixed(2)}</p>
          <p className="text-sm text-gray-400">{recurringExpenses.length} subscriptions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Annual Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recurringExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{expense.description}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800">
                    {getFrequencyLabel(expense.recurringFrequency || "monthly")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  ${getAnnualCost(expense.amount, expense.recurringFrequency || "monthly").toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recurringExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">No recurring expenses found</div>
        )}
      </div>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
    </div>
  );
}

