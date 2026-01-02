"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

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
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    goal: "",
    monthlyIncome: "",
    currency: "USD",
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);
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
        credentials: "include",
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
      if (!response.ok) {
        if (response.status === 401) {
          setError("You must be logged in to generate a financial plan");
          setTimeout(() => router.push("/"), 2000);
          return;
        }
        throw new Error("Failed to generate financial plan");
      }


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

  const handleContinue = async () => {
    const response = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify(financialPlan)

    }
  ,
);
    if (!response.ok){
      router.push("/");
    }
    router.push("/dashboard");
    

  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mb-4"></div>
          <h2 className="text-2xl font-semibold text-white">
            Analyzing your financial goals...
          </h2>
          <p className="text-gray-400 mt-2">
            Our AI is creating a personalized plan for you
          </p>
        </div>
      </div>
    );
  }

  // Refinement form when user wants to provide more context
  if (showRefinement && financialPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}>
        <div className="max-w-2xl w-full glass-card p-8" style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div className="mb-6">
            <button
              onClick={() => setShowRefinement(false)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 mb-4"
            >
              <span>←</span> Back to plan
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Help Us Improve Your Plan
            </h1>
            <p className="text-gray-400">
              Tell us what doesn't work for you so we can create a better personalized plan
            </p>
          </div>

          <form onSubmit={handleRefinementSubmit} className="space-y-6">
            {accumulatedContext && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <h3 className="font-semibold text-emerald-300 mb-2">Previous Context Provided:</h3>
                <p className="text-sm text-gray-400 whitespace-pre-line">{accumulatedContext}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {accumulatedContext ? "What else would you like to adjust?" : "What makes this plan unsuitable for you?"}
              </label>
              
              <textarea
                required
                value={refinementContext}
                onChange={(e) => setRefinementContext(e.target.value)}
                placeholder="For example:&#10;• Food costs more in my area&#10;• Gas is cheaper where I live&#10;• I still live with my parents (lower housing costs)&#10;• I have student loans to pay&#10;• Healthcare is more expensive for me&#10;• I need to support family members"
                rows={8}
                className="modern-input resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Be specific about your situation - the more details you provide, the better we can tailor your plan
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <h3 className="font-semibold text-amber-300 mb-2">Your Current Goal:</h3>
              <p className="text-gray-300">{financialPlan.Goal}</p>
              <p className="text-sm text-gray-500 mt-1">
                Monthly Income: {financialPlan.Currency} {financialPlan.MonthlyIncome.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowRefinement(false)}
                className="px-6 py-3 rounded-xl font-medium text-gray-300 transition-all"
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
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
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 animate-fade-in-up" style={{ background: 'rgba(18, 18, 26, 0.8)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h1 className="text-3xl font-bold text-white mb-2 animate-slide-in">
              Your Personalized Financial Plan
            </h1>
            <p className="text-gray-400 mb-8 animate-slide-in" style={{animationDelay: '0.1s'}}>
              Here's what we recommend based on your goals
            </p>

            {/* Goal Section */}
            <div className="mb-8 p-6 rounded-xl animate-fade-in" style={{animationDelay: '0.2s', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
              <h2 className="text-xl font-semibold text-emerald-300 mb-2">
                Your Goal
              </h2>
              <p className="text-lg text-white">{financialPlan.Goal}</p>
              <div className="mt-2 text-sm text-gray-400">
                Monthly Income: {financialPlan.Currency} {financialPlan.MonthlyIncome.toLocaleString()}
              </div>
            </div>

            {/* Structured Plan */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <h2 className="text-xl font-semibold text-white mb-3">
                Recommended Strategy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {financialPlan.StructuredPlan}
              </p>
            </div>

            {/* Visual Chart */}
            <div className="mb-8 p-6 rounded-xl animate-fade-in" style={{animationDelay: '0.4s', background: 'rgba(255, 255, 255, 0.02)'}}>
              <h2 className="text-xl font-semibold text-white mb-4">
                Budget Allocation Overview
              </h2>
              
              {/* Pie Chart Visual */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Simple Pie Chart using CSS */}
                <div className="relative w-64 h-64 flex-shrink-0 animate-scale-in" style={{animationDelay: '0.5s'}}>
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Essential Expenses - Purple */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${essentialPercent * 2.51} 251.2`}
                      strokeDashoffset="0"
                    />
                    {/* Savings - Cyan */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeDasharray={`${savingsPercent * 2.51} 251.2`}
                      strokeDashoffset={`-${essentialPercent * 2.51}`}
                    />
                    {/* Discretionary - Pink */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#84cc16"
                      strokeWidth="20"
                      strokeDasharray={`${discretionaryPercent * 2.51} 251.2`}
                      strokeDashoffset={`-${(essentialPercent + savingsPercent) * 2.51}`}
                    />
                    {/* Center circle */}
                    <circle cx="50" cy="50" r="30" fill="#12121a" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-3xl font-bold text-white">{financialPlan.Currency}</div>
                    <div className="text-2xl font-bold gradient-text">{totalIncome.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Monthly Income</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                    <div className="w-6 h-6 bg-emerald-500 rounded"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">Essential Expenses</div>
                      <div className="text-sm text-gray-400">
                        {financialPlan.Currency} {financialPlan.IncomeBreakdown.EssentialExpenses.toLocaleString()} ({essentialPercent.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 animate-slide-in-right" style={{animationDelay: '0.7s'}}>
                    <div className="w-6 h-6 bg-amber-500 rounded"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">Savings</div>
                      <div className="text-sm text-gray-400">
                        {financialPlan.Currency} {financialPlan.IncomeBreakdown.Savings.toLocaleString()} ({savingsPercent.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 animate-slide-in-right" style={{animationDelay: '0.8s'}}>
                    <div className="w-6 h-6 bg-lime-500 rounded"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">Discretionary Spending</div>
                      <div className="text-sm text-gray-400">
                        {financialPlan.Currency} {financialPlan.IncomeBreakdown.DiscretionarySpending.toLocaleString()} ({discretionaryPercent.toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Breakdown Cards */}
            <div className="mb-8 animate-fade-in" style={{animationDelay: '0.9s'}}>
              <h2 className="text-xl font-semibold text-white mb-4">
                Detailed Budget Breakdown
              </h2>
              
              <div className="grid gap-4 md:grid-cols-3">
                {/* Essential Expenses */}
                <div className="p-5 rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{animationDelay: '1s', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-emerald-300">
                      Essential Expenses
                    </h3>
                    <span className="text-2xl">🏠</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {financialPlan.Currency} {financialPlan.IncomeBreakdown.EssentialExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {financialPlan.IncomeBreakdown.EssentialExpensesPurpose}
                  </p>
                </div>

                {/* Savings */}
                <div className="p-5 rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{animationDelay: '1.1s', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-amber-300">Savings</h3>
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {financialPlan.Currency} {financialPlan.IncomeBreakdown.Savings.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {financialPlan.IncomeBreakdown.SavingsPurpose}
                  </p>
                </div>

                {/* Discretionary Spending */}
                <div className="p-5 rounded-xl transition-transform duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{animationDelay: '1.2s', background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.3)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lime-300">
                      Discretionary
                    </h3>
                    <span className="text-2xl">🎉</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {financialPlan.Currency} {financialPlan.IncomeBreakdown.DiscretionarySpending.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {financialPlan.IncomeBreakdown.DiscretionarySpendingPurpose}
                  </p>
                </div>
              </div>
            </div>

            {/* Satisfaction Check */}
            <div className="mb-6 p-6 rounded-xl animate-fade-in" style={{animationDelay: '1.3s', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
              <h3 className="text-lg font-semibold text-white mb-3 text-center">
                Are you satisfied with this financial plan?
              </h3>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleContinue}
                  className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transform transition text-white"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  <span>✓</span>
                  Yes, looks great!
                </button>
                <button
                  onClick={() => {
                    setShowRefinement(true);
                  }}
                  className="px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:scale-105 transform transition text-white"
                  style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
                >
                  <span>↻</span>
                  No, try again
                </button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">
                If you're not satisfied, you can regenerate the plan with adjusted parameters
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)' }}>
      <div className="max-w-md w-full glass-card p-8" style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to BudgetBuddy!
        </h1>
        <p className="text-gray-400 mb-8">
          Let's create a personalized financial plan to help you reach your goals
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-rose-300" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-gray-300 mb-2"
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
              className="modern-input"
            />
          </div>

          <div>
            <label
              htmlFor="monthlyIncome"
              className="block text-sm font-medium text-gray-300 mb-2"
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
              className="modern-input"
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="modern-input"
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
            className="w-full py-3 px-6 rounded-xl font-semibold text-lg text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' }}
          >
            Generate My Financial Plan
          </button>
        </form>
      </div>
    </div>
  );
}
