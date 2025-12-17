import { NextResponse } from "next/server";

export async function GET() {
  const summary = {
    totalExpenses: 841.97,
    totalBudget: 2350.0,
    totalSpent: 1391.97,
    budgetRemaining: 958.03,
    categoriesCount: 9,
    transactionsCount: 8,
    recurringExpensesCount: 3,
    topCategory: {
      name: "Travel",
      amount: 250.0,
    },
    overBudgetCategories: 1,
  };

  return NextResponse.json(summary);
}
