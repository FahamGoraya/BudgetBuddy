"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Expense, Budget, Category } from "../types";
import { defaultCategories } from "../lib/data";
import { getAuthHeaders, getToken } from "../lib/auth";

interface ExpenseContextType {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, "id">) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getTotalExpenses: () => number;
  getExpensesByCategory: () => { name: string; value: number; color: string }[];
  getMonthlyExpenses: () => { month: string; total: number }[];
  getRecurringExpenses: () => Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories] = useState<Category[]>(defaultCategories);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses from API
  const fetchExpenses = useCallback(async () => {
    // Check if token exists before making the request
    const token = getToken();
    if (!token) {
      // User not logged in, use empty array
      setExpenses([]);
      setLoading(false);
      setIsLoaded(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/expenses", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        // User not logged in, use empty array
        setExpenses([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      
      const data = await response.json();
      // Transform API response to match Expense type
      const transformedExpenses: Expense[] = data.map((exp: {
        id: string;
        amount: number;
        description: string;
        category: string;
        date: string;
        recurring: boolean;
        recurringFrequency?: string;
      }) => ({
        id: exp.id,
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: new Date(exp.date).toISOString().split('T')[0],
        isRecurring: exp.recurring,
        recurringFrequency: exp.recurringFrequency as Expense['recurringFrequency'],
      }));
      
      setExpenses(transformedExpenses);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  }, []);

  // Initial fetch and re-fetch when token becomes available
  useEffect(() => {
    // Load budgets from localStorage
    const storedBudgets = localStorage.getItem("budgets");
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }

    // Check if we have a token, if not wait a bit and check again
    // This handles the race condition where AuthProvider hasn't loaded the token yet
    const token = getToken();
    
    if (token) {
      fetchExpenses();
    } else {
      // Token not available yet, wait for it
      const checkForToken = setInterval(() => {
        const newToken = getToken();
        if (newToken) {
          clearInterval(checkForToken);
          fetchExpenses();
        }
      }, 100);

      // Cleanup and also set isLoaded after a timeout if no token appears
      const timeout = setTimeout(() => {
        clearInterval(checkForToken);
        setIsLoaded(true);
        setLoading(false);
      }, 2000);

      return () => {
        clearInterval(checkForToken);
        clearTimeout(timeout);
      };
    }
  }, [fetchExpenses]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets, isLoaded]);

  const refreshExpenses = async () => {
    await fetchExpenses();
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
          recurring: expense.isRecurring,
          recurringFrequency: expense.recurringFrequency,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      // Refresh expenses list from API
      await fetchExpenses();

      // Update budget spent amount
      const budget = budgets.find((b) => b.category === expense.category);
      if (budget) {
        updateBudget(budget.id, { spent: budget.spent + expense.amount });
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      throw err;
    }
  };

  const updateExpense = (id: string, updatedFields: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === id ? { ...expense, ...updatedFields } : expense))
    );
  };

  const deleteExpense = async (id: string) => {
    try {
      const expense = expenses.find((e) => e.id === id);
      
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      // Update local state
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));

      // Update budget
      if (expense) {
        const budget = budgets.find((b) => b.category === expense.category);
        if (budget) {
          updateBudget(budget.id, { spent: Math.max(0, budget.spent - expense.amount) });
        }
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    }
  };

  const addBudget = (budget: Omit<Budget, "id">) => {
    const newBudget = { ...budget, id: crypto.randomUUID() };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updatedFields: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((budget) => (budget.id === id ? { ...budget, ...updatedFields } : budget))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([name, value]) => {
      const category = categories.find((c) => c.name === name);
      return { name, value, color: category?.color || "#607D8B" };
    });
  };

  const getMonthlyExpenses = () => {
    const monthlyTotals: Record<string, number> = {};
    expenses.forEach((expense) => {
      const month = expense.date.substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getRecurringExpenses = () => {
    return expenses.filter((expense) => expense.isRecurring);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        categories,
        loading,
        error,
        refreshExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        addBudget,
        updateBudget,
        deleteBudget,
        getTotalExpenses,
        getExpensesByCategory,
        getMonthlyExpenses,
        getRecurringExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
}
