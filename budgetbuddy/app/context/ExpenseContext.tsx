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
  refreshBudgets: () => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
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

  // Fetch budgets from API
  const fetchBudgets = useCallback(async () => {
    // Check if token exists before making the request
    const token = getToken();
    if (!token) {
      // User not logged in, use empty array
      setBudgets([]);
      return;
    }

    try {
      setError(null);
      const response = await fetch("/api/budgets", {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      
      if (response.status === 401) {
        // User not logged in, use empty array
        setBudgets([]);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }
      
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch budgets");
    }
  }, []);

  // Initial fetch and re-fetch when token becomes available
  useEffect(() => {
    // Check if we have a token, if not wait a bit and check again
    // This handles the race condition where AuthProvider hasn't loaded the token yet
    const token = getToken();
    
    if (token) {
      fetchExpenses();
      fetchBudgets();
    } else {
      // Token not available yet, wait for it
      const checkForToken = setInterval(() => {
        const newToken = getToken();
        if (newToken) {
          clearInterval(checkForToken);
          fetchExpenses();
          fetchBudgets();
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
  }, [fetchExpenses, fetchBudgets]);

  const refreshExpenses = async () => {
    await fetchExpenses();
  };

  const refreshBudgets = async () => {
    await fetchBudgets();
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

      // Refresh expenses and budgets from API (budgets recalculate spent from expenses)
      await Promise.all([fetchExpenses(), fetchBudgets()]);
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
      const response = await fetch(`/api/expenses`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      // Refresh expenses and budgets from API (budgets recalculate spent from expenses)
      await Promise.all([fetchExpenses(), fetchBudgets()]);
    } catch (err) {
      console.error("Error deleting expense:", err);
      throw err;
    }
  };

  const addBudget = async (budget: Omit<Budget, "id">) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(budget),
      });

      if (!response.ok) {
        throw new Error("Failed to create budget");
      }

      // Refresh budgets list from API
      await fetchBudgets();
    } catch (err) {
      console.error("Error adding budget:", err);
      throw err;
    }
  };

  const updateBudget = async (id: string, updatedFields: Partial<Budget>) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error("Failed to update budget");
      }

      // Refresh budgets list from API
      await fetchBudgets();
    } catch (err) {
      console.error("Error updating budget:", err);
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      // Update local state
      setBudgets((prev) => prev.filter((budget) => budget.id !== id));
    } catch (err) {
      console.error("Error deleting budget:", err);
      throw err;
    }
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
        refreshBudgets,
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
