"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface IncomeBreakdown {
  EssentialExpenses: number;
  EssentialExpensesPurpose: string;
  Savings: number;
  SavingsPurpose: string;
  DiscretionarySpending: number;
  DiscretionarySpendingPurpose: string;
}

interface FinancialPlan {
  Goal: string;
  MonthlyIncome: number;
  Currency: string;
  StructuredPlan: string;
  IncomeBreakdown: IncomeBreakdown;
}

interface ApiResponse {
  success: boolean;
  data: {
    FinancialPlan: FinancialPlan;
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    goal: "",
    monthlyIncome: "",
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [error, setError] = useState("");
  const [showRefinement, setShowRefinement] = useState(false);
  const [refinementContext, setRefinementContext] = useState("");
  const [accumulatedContext, setAccumulatedContext] = useState(""); // Store all context across refinements
  const [originalGoal, setOriginalGoal] = useState("");
  const [originalIncome, setOriginalIncome] = useState("");
  const [originalCurrency, setOriginalCurrency] = useState("");

  const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"];

  const handleSubmit = async (e: React.FormEvent, newContext?: string) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Combine previous context with new context
    const combinedContext = newContext 
      ? accumulatedContext 
        ? `${accumulatedContext}\n\nAdditional refinement:\n${newContext}`
        : newContext
      : accumulatedContext;

    // Use original values if they exist (for refinements), otherwise use form data
    const goalToUse = originalGoal || formData.goal;
    const incomeToUse = originalIncome || formData.monthlyIncome;
    const currencyToUse = originalCurrency || formData.currency;

    try {
      const response = await fetch("/api/financial-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal: goalToUse,
          monthlyIncome: parseFloat(incomeToUse),
          currency: currencyToUse,
          additionalContext: combinedContext || "",
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data?.FinancialPlan) {
        setFinancialPlan(data.data.FinancialPlan);
        // Save the accumulated context if new context was provided
        if (newContext) {
          setAccumulatedContext(combinedContext);
        }
        // Store original values if this is the first generation (not a refinement)
        if (!originalGoal) {
          setOriginalGoal(goalToUse);
          setOriginalIncome(incomeToUse);
          setOriginalCurrency(currencyToUse);
        }
        // Clear form data after successful generation
        setFormData({ goal: "", monthlyIncome: "", currency: "USD" });
        setLoading(false);
      } else {
        const errorMsg = (data as any).details || (data as any).error || "Failed to generate financial plan. Please try again.";
        setError(errorMsg);
        console.error("API Error:", data);
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setError(errorMsg);
      console.error("Request Error:", err);
      setLoading(false);
    }
  };

  const handleRefinementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowRefinement(false);
    await handleSubmit(e, refinementContext);
    setRefinementContext(""); // Clear the input for next refinement
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Analyzing your financial goals...
          </h2>
          <p className="text-gray-600 mt-2">
            Our AI is creating a personalized plan for you
          </p>
        </div>
      </div>
    );
  }

  // Refinement form when user wants to provide more context
  if (showRefinement && financialPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <button
              onClick={() => setShowRefinement(false)}
              className="text-teal-600 hover:text-teal-700 flex items-center gap-2 mb-4"
            >
              <span>←</span> Back to plan
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Help Us Improve Your Plan
            </h1>
            <p className="text-gray-600">
              Tell us what doesn't work for you so we can create a better personalized plan
            </p>
          </div>

          <form onSubmit={handleRefinementSubmit} className="space-y-6">
            {accumulatedContext && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Previous Context Provided:</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{accumulatedContext}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {accumulatedContext ? "What else would you like to adjust?" : "What makes this plan unsuitable for you?"}
              </label>
              
              <textarea
                required
                value={refinementContext}
                onChange={(e) => setRefinementContext(e.target.value)}
                placeholder="For example:&#10;• Food costs more in my area&#10;• Gas is cheaper where I live&#10;• I still live with my parents (lower housing costs)&#10;• I have student loans to pay&#10;• Healthcare is more expensive for me&#10;• I need to support family members"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Be specific about your situation - the more details you provide, the better we can tailor your plan
              </p>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-semibold text-teal-900 mb-2">Your Current Goal:</h3>
              <p className="text-gray-700">{financialPlan.Goal}</p>
              <p className="text-sm text-gray-600 mt-1">
                Monthly Income: {financialPlan.Currency} {financialPlan.MonthlyIncome.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowRefinement(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold"
              >
                Generate Better Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (financialPlan) {
    const totalIncome = financialPlan.MonthlyIncome;
    const essentialPercent = (financialPlan.IncomeBreakdown.EssentialExpenses / totalIncome) * 100;
    const savingsPercent = (financialPlan.IncomeBreakdown.Savings / totalIncome) * 100;
    const discretionaryPercent = (financialPlan.IncomeBreakdown.DiscretionarySpending / totalIncome) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-slide-in">
              Your Personalized Financial Plan
            </h1>
            <p className="text-gray-600 mb-8 animate-slide-in" style={{animationDelay: '0.1s'}}>
              Here's what we recommend based on your goals
            </p>

            {/* Goal Section */}
            <div className="mb-8 p-6 bg-teal-50 rounded-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h2 className="text-xl font-semibold text-teal-900 mb-2">
                Your Goal
              </h2>
              <p className="text-lg text-gray-800">{financialPlan.Goal}</p>
              <div className="mt-2 text-sm text-gray-600">
                Monthly Income: {financialPlan.Currency} {financialPlan.MonthlyIncome.toLocaleString()}
              </div>
            </div>

            {/* Structured Plan */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Recommended Strategy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {financialPlan.StructuredPlan}
              </p>
            </div>

            {/* Visual Chart */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Budget Allocation Overview
              </h2>
              
              {/* Pie Chart Visual */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Simple Pie Chart using CSS */}
                <div className="relative w-64 h-64 flex-shrink-0 animate-scale-in" style={{animationDelay: '0.5s'}}>
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Essential Expenses - Teal */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="20"
                      strokeDasharray={`${essentialPercent * 2.51} 251.2`}
                      strokeDashoffset="0"
                    />
                    {/* Savings - Dark Green */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="20"
                      strokeDasharray={`${savingsPercent * 2.51} 251.2`}
                      strokeDashoffset={`-${essentialPercent * 2.51}`}
                    />
                    {/* Discretionary - Emerald */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${discretionaryPercent * 2.51} 251.2`}
                      strokeDashoffset={`-${(essentialPercent + savingsPercent) * 2.51}`}
                    />
                    {/* Center circle */}
                    <circle cx="50" cy="50" r="30" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-3xl font-bold text-gray-800">{financialPlan.Currency}</div>
                    <div className="text-2xl font-bold text-gray-800">{totalIncome.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Monthly Income</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                    <div className="w-6 h-6 bg-teal-500 rounded"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">Essential Expenses</div>
                      <div className="text-sm text-gray-600">
                        {financialPlan.Currency} {financialPlan.IncomeBreakdown.EssentialExpenses.toLocaleString()} ({essentialPercent.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 animate-slide-in-right" style={{animationDelay: '0.7s'}}>
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">Savings</div>
                      <div className="text-sm text-gray-600">
                        {financialPlan.Currency} {financialPlan.IncomeBreakdown.Savings.toLocaleString()} ({savingsPercent.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 animate-slide-in-right" style={{animationDelay: '0.8s'}}>
                    <div className="w-6 h-6 bg-emerald-500 rounded"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">Discretionary Spending</div>
                      <div className="text-sm text-gray-600">
                        {financialPlan.Currency} {financialPlan.IncomeBreakdown.DiscretionarySpending.toLocaleString()} ({discretionaryPercent.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Breakdown Cards */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '0.9s'}}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Detailed Budget Breakdown
              </h2>
              
              <div className="grid gap-4 md:grid-cols-3">
                {/* Essential Expenses */}
                <div className="p-5 bg-teal-50 rounded-lg border-2 border-teal-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg animate-fade-in" style={{animationDelay: '1s'}}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-teal-900">
                      Essential Expenses
                    </h3>
                    <span className="text-2xl">🏠</span>
                  </div>
                  <p className="text-3xl font-bold text-teal-700 mb-2">
                    {financialPlan.Currency} {financialPlan.IncomeBreakdown.EssentialExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {financialPlan.IncomeBreakdown.EssentialExpensesPurpose}
                  </p>
                </div>

                {/* Savings */}
                <div className="p-5 bg-green-50 rounded-lg border-2 border-green-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg animate-fade-in" style={{animationDelay: '1.1s'}}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-900">Savings</h3>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700 mb-2">
                    {financialPlan.Currency} {financialPlan.IncomeBreakdown.Savings.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {financialPlan.IncomeBreakdown.SavingsPurpose}
                  </p>
                </div>

                {/* Discretionary Spending */}
                <div className="p-5 bg-emerald-50 rounded-lg border-2 border-emerald-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg animate-fade-in" style={{animationDelay: '1.2s'}}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-emerald-900">
                      Discretionary
                    </h3>
                    <span className="text-2xl">🎉</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700 mb-2">
                    {financialPlan.Currency} {financialPlan.IncomeBreakdown.DiscretionarySpending.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {financialPlan.IncomeBreakdown.DiscretionarySpendingPurpose}
                  </p>
                </div>
              </div>
            </div>

            {/* Satisfaction Check */}
            <div className="mb-6 p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border-2 border-teal-200 animate-fade-in" style={{animationDelay: '1.3s'}}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                Are you satisfied with this financial plan?
              </h3>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleContinue}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 hover:scale-105 transform"
                >
                  <span>✓</span>
                  Yes, looks great!
                </button>
                <button
                  onClick={() => {
                    setShowRefinement(true);
                  }}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center gap-2 hover:scale-105 transform"
                >
                  <span>↻</span>
                  No, try again
                </button>
              </div>
              <p className="text-center text-sm text-gray-600 mt-3">
                If you're not satisfied, you can regenerate the plan with adjusted parameters
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to BudgetBuddy!
        </h1>
        <p className="text-gray-600 mb-8">
          Let's create a personalized financial plan to help you reach your goals
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What's your financial goal?
            </label>
            <input
              type="text"
              id="goal"
              required
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              placeholder="e.g., Save for a house down payment"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="monthlyIncome"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Monthly Income
            </label>
            <input
              type="number"
              id="monthlyIncome"
              required
              min="0"
              step="0.01"
              value={formData.monthlyIncome}
              onChange={(e) =>
                setFormData({ ...formData, monthlyIncome: e.target.value })
              }
              placeholder="5000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition font-semibold text-lg"
          >
            Generate My Financial Plan
          </button>
        </form>
      </div>
    </div>
  );
}
