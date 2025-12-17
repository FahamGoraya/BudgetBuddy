import { Expense, Budget, Category } from "../types";

export const defaultCategories: Category[] = [
  { id: "1", name: "Food & Dining", color: "#FF6384" },
  { id: "2", name: "Transportation", color: "#36A2EB" },
  { id: "3", name: "Shopping", color: "#FFCE56" },
  { id: "4", name: "Entertainment", color: "#4BC0C0" },
  { id: "5", name: "Bills & Utilities", color: "#9966FF" },
  { id: "6", name: "Healthcare", color: "#FF9F40" },
  { id: "7", name: "Education", color: "#C9CBCF" },
  { id: "8", name: "Travel", color: "#7C4DFF" },
  { id: "9", name: "Other", color: "#607D8B" },
];

export const sampleExpenses: Expense[] = [
  {
    id: "1",
    amount: 45.99,
    description: "Grocery shopping",
    category: "Food & Dining",
    date: "2025-12-15",
    isRecurring: false,
  },
  {
    id: "2",
    amount: 120.0,
    description: "Monthly bus pass",
    category: "Transportation",
    date: "2025-12-01",
    isRecurring: true,
    recurringFrequency: "monthly",
  },
  {
    id: "3",
    amount: 89.99,
    description: "New headphones",
    category: "Shopping",
    date: "2025-12-10",
    isRecurring: false,
  },
  {
    id: "4",
    amount: 15.99,
    description: "Netflix subscription",
    category: "Entertainment",
    date: "2025-12-05",
    isRecurring: true,
    recurringFrequency: "monthly",
  },
  {
    id: "5",
    amount: 85.0,
    description: "Electric bill",
    category: "Bills & Utilities",
    date: "2025-12-03",
    isRecurring: true,
    recurringFrequency: "monthly",
  },
  {
    id: "6",
    amount: 200.0,
    description: "Doctor visit",
    category: "Healthcare",
    date: "2025-11-28",
    isRecurring: false,
  },
  {
    id: "7",
    amount: 35.0,
    description: "Online course",
    category: "Education",
    date: "2025-11-20",
    isRecurring: false,
  },
  {
    id: "8",
    amount: 250.0,
    description: "Weekend trip",
    category: "Travel",
    date: "2025-11-15",
    isRecurring: false,
  },
];

export const sampleBudgets: Budget[] = [
  { id: "1", category: "Food & Dining", limit: 500, spent: 245.99 },
  { id: "2", category: "Transportation", limit: 200, spent: 120.0 },
  { id: "3", category: "Shopping", limit: 300, spent: 189.99 },
  { id: "4", category: "Entertainment", limit: 150, spent: 65.99 },
  { id: "5", category: "Bills & Utilities", limit: 400, spent: 285.0 },
  { id: "6", category: "Healthcare", limit: 200, spent: 200.0 },
  { id: "7", category: "Education", limit: 100, spent: 35.0 },
  { id: "8", category: "Travel", limit: 500, spent: 250.0 },
];
