"use client";

import { useState, useEffect } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../lib/auth";
import ExpenseForm from "../components/ExpenseForm";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import BudgetProgressChart from "../components/charts/BudgetProgressChart";

export default function Dashboard() {
  const { expenses, getTotalExpenses, getRecurringExpenses, budgets, categories } = useExpenses();
  const { user } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [financialPlan, setFinancialPlan] = useState<any>(null);
  const [hasPlan, setHasPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialPlan();
  }, []);

  const fetchFinancialPlan = async () => {
    try {
      const response = await fetchWithAuth('/api/financial-plan');
      const data = await response.json();
      
      if (data.success && data.hasPlan) {
        setFinancialPlan(data.plan);
        setHasPlan(true);
      } else {
        setHasPlan(false);
      }
    } catch (error) {
      console.error('Error fetching financial plan:', error);
      setHasPlan(false);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = getTotalExpenses();
  const recurringExpenses = getRecurringExpenses();
  const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? "Good Morning" : currentDate.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  // Get plan-based data
  const planMonthlyIncome = financialPlan?.monthlyIncome || 0;
  const planSavings = financialPlan?.savings || 0;
  const planEssentialExpenses = financialPlan?.essentialExpenses || 0;
  const planDiscretionarySpending = financialPlan?.discretionarySpending || 0;

  // Calculate spending health metrics
  const essentialPercentage = planMonthlyIncome > 0 ? (planEssentialExpenses / planMonthlyIncome) * 100 : 0;
  const savingsPercentage = planMonthlyIncome > 0 ? (planSavings / planMonthlyIncome) * 100 : 0;
  const discretionaryPercentage = planMonthlyIncome > 0 ? (planDiscretionarySpending / planMonthlyIncome) * 100 : 0;
  const actualSavings = planMonthlyIncome - totalExpenses;
  const savingsGoalProgress = planSavings > 0 ? (actualSavings / planSavings) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md">
          <span className="text-8xl block">📊</span>
          <h2 className="text-3xl font-bold text-gray-900">No Financial Plan Yet</h2>
          <p className="text-gray-600">Create your personalized financial plan to see your dashboard.</p>
          <button className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg">
            Create Your Plan →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl overflow-hidden animate-slideUp">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-2">
              <p className="text-teal-100 text-sm font-medium animate-fadeIn">{greeting} 👋</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-slideRight">{user?.name || "User"}</h1>
              <p className="text-teal-50 text-lg">Your financial journey at a glance</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full animate-fadeIn">
                <span className="text-2xl">🎯</span>
                <p className="text-sm font-medium">{financialPlan.goal}</p>
              </div>
            </div>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="px-8 py-4 bg-white text-teal-600 rounded-2xl font-bold hover:bg-teal-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
            >
              ➕ Add Expense
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">
            {[
              { label: "Monthly Income", value: planMonthlyIncome, icon: "💰", color: "from-blue-500 to-blue-600" },
              { label: "Target Savings", value: planSavings, icon: "🎯", color: "from-emerald-500 to-emerald-600" },
              { label: "Essential Expenses", value: planEssentialExpenses, icon: "🏠", color: "from-orange-500 to-orange-600" },
              { label: "Discretionary", value: planDiscretionarySpending, icon: "🎉", color: "from-purple-500 to-purple-600" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/25 transition-all transform hover:scale-105 cursor-pointer animate-fadeIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{item.icon}</span>
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} animate-pulse`}></div>
                </div>
                <p className="text-teal-100 text-xs md:text-sm mb-1">{item.label}</p>
                <p className="text-2xl md:text-3xl font-bold">${item.value.toFixed(2)}</p>
                <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                  <div className={`h-1 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${(item.value / planMonthlyIncome) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Financial Plan */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl animate-slideUp">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">📋</span>
          <div>
            <h3 className="text-3xl font-bold">Your Financial Strategy</h3>
            <p className="text-indigo-100">AI-Generated personalized plan</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
          <p className="text-white leading-relaxed text-lg whitespace-pre-wrap">{financialPlan.structuredPlan}</p>
        </div>
      </div>

      {/* Financial Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">💳</span>
            <div className="text-right">
              <div className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {expenses.length} transactions
              </div>
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-2">Total Expenses This Month</p>
          <p className="text-4xl font-bold mb-3">${totalExpenses.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <span>{totalExpenses < planEssentialExpenses ? '🟢' : '🔴'}</span>
            <span>{planMonthlyIncome > 0 ? ((totalExpenses / planMonthlyIncome) * 100).toFixed(1) : 0}% of income</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">💰</span>
            <div className="text-right">
              <div className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {savingsGoalProgress.toFixed(0)}% of goal
              </div>
            </div>
          </div>
          <p className="text-emerald-100 text-sm mb-2">Potential Savings</p>
          <p className="text-4xl font-bold mb-3">${actualSavings.toFixed(2)}</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${Math.min(savingsGoalProgress, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all animate-slideUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">🔄</span>
            <div className="text-right">
              <div className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {recurringExpenses.length} subscriptions
              </div>
            </div>
          </div>
          <p className="text-purple-100 text-sm mb-2">Monthly Recurring</p>
          <p className="text-4xl font-bold mb-3">${totalRecurring.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <span>🔄</span>
            <span>Auto-renewing each month</span>
          </div>
        </div>
      </div>

      {/* Budget Split - Income Allocation */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200 animate-slideUp">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">🎯</span>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Budget Allocation</h3>
            <p className="text-gray-600 text-sm">How your income is distributed</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🏠</span>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {essentialPercentage.toFixed(0)}%
                  </div>
                </div>
                <p className="text-teal-100 text-sm mb-2">Essential Expenses</p>
                <p className="text-4xl font-bold mb-3">${financialPlan.essentialExpenses.toFixed(2)}</p>
                <p className="text-xs text-teal-100 leading-relaxed opacity-90">{financialPlan.essentialExpensesPurpose}</p>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="h-2 bg-white rounded-full" style={{ width: `${essentialPercentage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">💎</span>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {savingsPercentage.toFixed(0)}%
                  </div>
                </div>
                <p className="text-emerald-100 text-sm mb-2">Savings Goal</p>
                <p className="text-4xl font-bold mb-3">${financialPlan.savings.toFixed(2)}</p>
                <p className="text-xs text-emerald-100 leading-relaxed opacity-90">{financialPlan.savingsPurpose}</p>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="h-2 bg-white rounded-full" style={{ width: `${savingsPercentage}%` }}></div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">🎉</span>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {discretionaryPercentage.toFixed(0)}%
                  </div>
                </div>
                <p className="text-blue-100 text-sm mb-2">Discretionary Spending</p>
                <p className="text-4xl font-bold mb-3">${financialPlan.discretionarySpending.toFixed(2)}</p>
                <p className="text-xs text-blue-100 leading-relaxed opacity-90">{financialPlan.discretionarySpendingPurpose}</p>
                <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                  <div className="h-2 bg-white rounded-full" style={{ width: `${discretionaryPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Income Allocation Visual */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span>
              Income Breakdown Visualization
            </h4>
            <div className="flex gap-1 h-12 rounded-xl overflow-hidden mb-4">
              <div className="bg-teal-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${essentialPercentage}%` }}>
                {essentialPercentage > 10 && `${essentialPercentage.toFixed(0)}%`}
              </div>
              <div className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${savingsPercentage}%` }}>
                {savingsPercentage > 10 && `${savingsPercentage.toFixed(0)}%`}
              </div>
              <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${discretionaryPercentage}%` }}>
                {discretionaryPercentage > 10 && `${discretionaryPercentage.toFixed(0)}%`}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-4 h-4 bg-teal-500 rounded mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-700">Essentials</p>
              </div>
              <div>
                <div className="w-4 h-4 bg-emerald-500 rounded mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-700">Savings</p>
              </div>
              <div>
                <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                <p className="text-xs font-medium text-gray-700">Discretionary</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Spending Overview</h3>
            <p className="text-gray-500 text-sm mt-1">Track your spending against your budget limits</p>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-emerald-50 px-6 py-3 rounded-2xl">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-xs text-gray-600">Budget Health</p>
              <p className="text-lg font-bold text-gray-900">{budgetPercentage > 0 ? (100 - budgetPercentage).toFixed(0) : 100}%</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💼</span>
              </div>
              <div className="text-xs font-medium text-gray-600">{budgets.length} categories</div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💸</span>
              </div>
              <div className="text-xs font-medium text-orange-600">{budgetPercentage.toFixed(0)}% used</div>
            </div>
            <p className="text-orange-700 text-sm mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-orange-900">${totalSpent.toFixed(2)}</p>
          </div>

          <div className={`bg-gradient-to-br rounded-2xl p-5 border ${budgetRemaining >= 0 ? 'from-emerald-50 to-green-50 border-emerald-200' : 'from-red-50 to-red-100 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${budgetRemaining >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <span className="text-2xl">{budgetRemaining >= 0 ? '✅' : '⚠️'}</span>
              </div>
              <div className={`text-xs font-medium ${budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {budgetRemaining >= 0 ? 'On track' : 'Over budget'}
              </div>
            </div>
            <p className={`text-sm mb-1 ${budgetRemaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Remaining</p>
            <p className={`text-3xl font-bold ${budgetRemaining >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
              ${Math.abs(budgetRemaining).toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-xs font-medium text-purple-600">Avg per day</div>
            </div>
            <p className="text-purple-700 text-sm mb-1">Daily Spending</p>
            <p className="text-3xl font-bold text-purple-900">${(totalExpenses / Math.max(new Date().getDate(), 1)).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-slideUp">
          <ExpensePieChart />
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-slideUp">
          <MonthlyBarChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-slideUp">
          <BudgetProgressChart />
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 animate-slideUp">
          <h3 className="text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
            <span>📝</span>
            Recent Transactions
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {expenses
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map((expense, idx) => {
                const category = categories.find((c) => c.name === expense.category);
                return (
                  <div 
                    key={expense.id} 
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-100 hover:border-teal-200 hover:shadow-md animate-fadeIn"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transform hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">${expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            {expenses.length === 0 && (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">💸</span>
                <p className="text-gray-400 text-lg mb-4">No transactions yet</p>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Add your first expense →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
    </div>
  );
}
