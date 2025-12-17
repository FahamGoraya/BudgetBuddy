export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface MonthlyData {
  month: string;
  total: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}
