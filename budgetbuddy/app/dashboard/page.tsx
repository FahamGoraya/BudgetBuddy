"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchWithAuth } from "../lib/auth";
import { useRouter } from "next/navigation";
import { 
  Target, 
  Home, 
  PiggyBank, 
  PartyPopper, 
  BarChart3, 
  Bot, 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  Table, 
  Info 
} from "lucide-react";

interface FinancialPlan {
  id: string;
  userId: string;
  goal: string;
  monthlyIncome: number;
  currency: string;
  structuredPlan: string;
  essentialExpenses: number;
  essentialExpensesPurpose: string;
  savings: number;
  savingsPurpose: string;
  discretionarySpending: number;
  discretionarySpendingPurpose: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
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

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? "Good Morning" : currentDate.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  // Calculate percentages
  const monthlyIncome = financialPlan?.monthlyIncome || 0;
  const essentialExpenses = financialPlan?.essentialExpenses || 0;
  const savings = financialPlan?.savings || 0;
  const discretionarySpending = financialPlan?.discretionarySpending || 0;
  
  const essentialPercentage = monthlyIncome > 0 ? (essentialExpenses / monthlyIncome) * 100 : 0;
  const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const discretionaryPercentage = monthlyIncome > 0 ? (discretionarySpending / monthlyIncome) * 100 : 0;
  const totalAllocated = essentialExpenses + savings + discretionarySpending;
  const unallocated = monthlyIncome - totalAllocated;
  const unallocatedPercentage = monthlyIncome > 0 ? (unallocated / monthlyIncome) * 100 : 0;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      INR: '₹'
    };
    return symbols[currency] || currency;
  };

  const currencySymbol = getCurrencySymbol(financialPlan?.currency || 'USD');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your financial plan...</p>
        </div>
      </div>
    );
  }

  if (!hasPlan || !financialPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <BarChart3 className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">No Financial Plan Yet</h2>
          <p className="text-gray-600">Create your personalized financial plan to see your dashboard.</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Create Your Plan →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section with Goal */}
      <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl overflow-hidden animate-slideUp">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-3">
              <p className="text-teal-100 text-sm font-medium animate-fadeIn">{greeting}</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-slideRight">{user?.name || "User"}</h1>
              <p className="text-teal-50 text-lg">Your complete financial plan overview</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm">
                <span className="text-teal-100">Currency: </span>
                <span className="font-bold">{financialPlan.currency}</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-xs">
                <span className="text-teal-100">Last updated: </span>
                <span>{formatDate(financialPlan.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Financial Goal Card */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-teal-100 mb-1">Your Financial Goal</h3>
                <p className="text-2xl md:text-3xl font-bold leading-tight">{financialPlan.goal}</p>
              </div>
            </div>
          </div>

          {/* Monthly Income Highlight */}
          <div className="mt-6 text-center">
            <p className="text-teal-100 text-sm mb-2">Monthly Income</p>
            <p className="text-5xl md:text-6xl font-bold">{currencySymbol}{monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Budget Allocation Overview */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slideUp">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Budget Allocation</h2>
            <p className="text-gray-500 text-sm">How your income is distributed across categories</p>
          </div>
        </div>

        {/* Visual Income Breakdown Bar */}
        <div className="mb-8">
          <div className="flex gap-1 h-16 rounded-2xl overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-b from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold transition-all hover:brightness-110 cursor-pointer group relative"
              style={{ width: `${essentialPercentage}%` }}
            >
              {essentialPercentage > 15 && (
                <span className="text-sm">{essentialPercentage.toFixed(0)}%</span>
              )}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Essential: {currencySymbol}{essentialExpenses.toLocaleString()}
              </div>
            </div>
            <div 
              className="bg-gradient-to-b from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold transition-all hover:brightness-110 cursor-pointer group relative"
              style={{ width: `${savingsPercentage}%` }}
            >
              {savingsPercentage > 15 && (
                <span className="text-sm">{savingsPercentage.toFixed(0)}%</span>
              )}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Savings: {currencySymbol}{savings.toLocaleString()}
              </div>
            </div>
            <div 
              className="bg-gradient-to-b from-green-400 to-green-600 flex items-center justify-center text-white font-bold transition-all hover:brightness-110 cursor-pointer group relative"
              style={{ width: `${discretionaryPercentage}%` }}
            >
              {discretionaryPercentage > 15 && (
                <span className="text-sm">{discretionaryPercentage.toFixed(0)}%</span>
              )}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Discretionary: {currencySymbol}{discretionarySpending.toLocaleString()}
              </div>
            </div>
            {unallocated > 0 && (
              <div 
                className="bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center text-gray-700 font-bold transition-all hover:brightness-110 cursor-pointer group relative"
                style={{ width: `${unallocatedPercentage}%` }}
              >
                {unallocatedPercentage > 10 && (
                  <span className="text-sm">{unallocatedPercentage.toFixed(0)}%</span>
                )}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Unallocated: {currencySymbol}{unallocated.toLocaleString()}
                </div>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-teal-400 to-teal-600"></div>
              <span className="text-sm text-gray-600">Essential ({essentialPercentage.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
              <span className="text-sm text-gray-600">Savings ({savingsPercentage.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-green-400 to-green-600"></div>
              <span className="text-sm text-gray-600">Discretionary ({discretionaryPercentage.toFixed(1)}%)</span>
            </div>
            {unallocated > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <span className="text-sm text-gray-600">Unallocated ({unallocatedPercentage.toFixed(1)}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* Allocation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Essential Expenses Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 text-white transform hover:scale-[1.02] transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                  {essentialPercentage.toFixed(1)}%
                </div>
              </div>
              <h3 className="text-lg font-semibold text-teal-100 mb-1">Essential Expenses</h3>
              <p className="text-4xl font-bold mb-4">{currencySymbol}{essentialExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-teal-100 mb-1">Purpose</p>
                <p className="text-white text-sm leading-relaxed">{financialPlan.essentialExpensesPurpose}</p>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                <div className="h-2 bg-white rounded-full" style={{ width: `${essentialPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Savings Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white transform hover:scale-[1.02] transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <PiggyBank className="w-7 h-7 text-white" />
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                  {savingsPercentage.toFixed(1)}%
                </div>
              </div>
              <h3 className="text-lg font-semibold text-emerald-100 mb-1">Savings</h3>
              <p className="text-4xl font-bold mb-4">{currencySymbol}{savings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-emerald-100 mb-1">Purpose</p>
                <p className="text-white text-sm leading-relaxed">{financialPlan.savingsPurpose}</p>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                <div className="h-2 bg-white rounded-full" style={{ width: `${savingsPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Discretionary Spending Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white transform hover:scale-[1.02] transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <PartyPopper className="w-7 h-7 text-white" />
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                  {discretionaryPercentage.toFixed(1)}%
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-100 mb-1">Discretionary Spending</h3>
              <p className="text-4xl font-bold mb-4">{currencySymbol}{discretionarySpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-green-100 mb-1">Purpose</p>
                <p className="text-white text-sm leading-relaxed">{financialPlan.discretionarySpendingPurpose}</p>
              </div>
              <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                <div className="h-2 bg-white rounded-full" style={{ width: `${discretionaryPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Structured Plan */}
      <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl animate-slideUp">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Your AI-Generated Financial Strategy</h2>
            <p className="text-teal-100 mt-1">Personalized plan created based on your goals and income</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="prose prose-invert max-w-none">
            <p className="text-white leading-relaxed text-lg whitespace-pre-wrap">{financialPlan.structuredPlan}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideUp">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500 font-medium">Monthly</div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Income</p>
          <p className="text-3xl font-bold text-gray-900">{currencySymbol}{monthlyIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500 font-medium">Allocated</div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Outflow</p>
          <p className="text-3xl font-bold text-gray-900">{currencySymbol}{totalAllocated.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500 font-medium">Target</div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Monthly Savings</p>
          <p className="text-3xl font-bold text-gray-900">{currencySymbol}{savings.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs text-gray-500 font-medium">Created</div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Plan Created</p>
          <p className="text-lg font-bold text-gray-900">{new Date(financialPlan.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-slideUp">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Table className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Financial Breakdown</h2>
            <p className="text-gray-500 text-sm">All details from your financial plan</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">% of Income</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-teal-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-teal-700" />
                    </div>
                    <span className="font-medium text-gray-900">Essential Expenses</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-lg font-bold text-teal-600">{currencySymbol}{essentialExpenses.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${essentialPercentage}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{essentialPercentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm max-w-md">{financialPlan.essentialExpensesPurpose}</td>
              </tr>
              <tr className="hover:bg-emerald-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="font-medium text-gray-900">Savings</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-lg font-bold text-emerald-600">{currencySymbol}{savings.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${savingsPercentage}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{savingsPercentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm max-w-md">{financialPlan.savingsPurpose}</td>
              </tr>
              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <PartyPopper className="w-5 h-5 text-green-700" />
                    </div>
                    <span className="font-medium text-gray-900">Discretionary Spending</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-lg font-bold text-green-600">{currencySymbol}{discretionarySpending.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${discretionaryPercentage}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{discretionaryPercentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm max-w-md">{financialPlan.discretionarySpendingPurpose}</td>
              </tr>
              <tr className="bg-emerald-50 font-bold">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-200 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-emerald-700" />
                    </div>
                    <span className="font-bold text-gray-900">Total Allocated</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-lg font-bold text-emerald-700">{currencySymbol}{totalAllocated.toLocaleString()}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-emerald-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${((totalAllocated / monthlyIncome) * 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-emerald-700">{((totalAllocated / monthlyIncome) * 100).toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">Combined allocation from all categories</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Metadata */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-200 animate-slideUp">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-200 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Plan Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Plan ID</p>
            <p className="font-mono text-sm text-gray-700 truncate">{financialPlan.id}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Currency</p>
            <p className="font-bold text-gray-900">{financialPlan.currency}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Created</p>
            <p className="font-medium text-gray-900">{formatDate(financialPlan.createdAt)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Last Updated</p>
            <p className="font-medium text-gray-900">{formatDate(financialPlan.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
