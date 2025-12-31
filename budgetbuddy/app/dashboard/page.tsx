"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext";
import ExpenseForm from "../components/ExpenseForm";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import BudgetProgressChart from "../components/charts/BudgetProgressChart";

export default function Dashboard() {
  const { expenses, getTotalExpenses, getRecurringExpenses, budgets, categories } = useExpenses();
  const { user } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const totalExpenses = getTotalExpenses();
  const recurringExpenses = getRecurringExpenses();
  const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? "Good Morning" : currentDate.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-teal-200 mb-1">{greeting}</p>
            <h1 className="text-3xl font-bold mb-2">{user?.name || "User"}</h1>
            <p className="text-teal-200">Here is your financial overview for this month</p>
          </div>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="px-6 py-3 bg-white text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg"
          >
            Add Expense
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-teal-200 text-sm">Total Spent</p>
            <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-teal-200 text-sm">Recurring</p>
            <p className="text-2xl font-bold">${totalRecurring.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-teal-200 text-sm">Budget</p>
            <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-teal-200 text-sm">Remaining</p>
            <p className={`text-2xl font-bold ${budgetRemaining < 0 ? "text-red-300" : ""}`}>
              ${budgetRemaining.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {expenses.length} items
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-emerald-500 rounded-full" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              {recurringExpenses.length} active
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Recurring</p>
          <p className="text-2xl font-bold text-gray-900">${totalRecurring.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-green-500 rounded-full" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {budgets.length} categories
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${budgetRemaining >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
              <div className={`w-6 h-6 rounded-full ${budgetRemaining >= 0 ? "bg-emerald-500" : "bg-red-500"}`} />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${budgetRemaining >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
              {budgetPercentage.toFixed(0)}% used
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Budget Remaining</p>
          <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            ${Math.abs(budgetRemaining).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <ExpensePieChart />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <MonthlyBarChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <BudgetProgressChart />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Transactions</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expenses
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((expense) => {
                const category = categories.find((c) => c.name === expense.category);
                return (
                  <div key={expense.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{expense.date}</p>
                    </div>
                  </div>
                );
              })}
            {expenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions yet</p>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="mt-2 text-teal-600 font-medium hover:text-teal-700"
                >
                  Add your first expense
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Account Holder</p>
            <p className="font-medium text-gray-900">{user?.name || "User"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="font-medium text-gray-900">{user?.email || "user@example.com"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Currency</p>
            <p className="font-medium text-gray-900">{user?.currency || "USD"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">{user?.joinedDate || "2025-01-15"}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-teal-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Categories</p>
                <p className="font-semibold text-gray-900">{categories.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-emerald-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Budgets</p>
                <p className="font-semibold text-gray-900">{budgets.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-green-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-gray-500">This Month</p>
                <p className="font-semibold text-gray-900">{expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length} transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-orange-500 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Subscriptions</p>
                <p className="font-semibold text-gray-900">{recurringExpenses.length} active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
    </div>
  );
}
