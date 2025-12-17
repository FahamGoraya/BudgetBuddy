"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Expense, Budget, Category } from "../types";
import { defaultCategories, sampleExpenses, sampleBudgets } from "../lib/data";

interface ExpenseContextType {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
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

  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses");
    const storedBudgets = localStorage.getItem("budgets");

    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses(sampleExpenses);
    }

    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    } else {
      setBudgets(sampleBudgets);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets, isLoaded]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setExpenses((prev) => [...prev, newExpense]);

    const budget = budgets.find((b) => b.category === expense.category);
    if (budget) {
      updateBudget(budget.id, { spent: budget.spent + expense.amount });
    }
  };

  const updateExpense = (id: string, updatedFields: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((expense) => (expense.id === id ? { ...expense, ...updatedFields } : expense))
    );
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      const budget = budgets.find((b) => b.category === expense.category);
      if (budget) {
        updateBudget(budget.id, { spent: Math.max(0, budget.spent - expense.amount) });
      }
    }
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
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
