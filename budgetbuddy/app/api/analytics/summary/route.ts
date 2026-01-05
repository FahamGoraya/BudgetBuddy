import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { db } from "@/app/db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { budgets, expenses, categories } from "@/app/db/schema";

// Helper to get current month date range
function getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startOfMonth, endOfMonth } = getCurrentMonthRange();

    // Get total expenses for current month
    const totalExpensesResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`.as('total'),
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, user.userId),
          gte(expenses.date, startOfMonth),
          lte(expenses.date, endOfMonth)
        )
      );

    const totalExpenses = totalExpensesResult[0]?.total || 0;
    const transactionsCount = Number(totalExpensesResult[0]?.count) || 0;

    // Get recurring expenses count
    const recurringResult = await db
      .select({
        count: sql<number>`COUNT(*)`.as('count')
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, user.userId),
          eq(expenses.recurring, true)
        )
      );
    const recurringExpensesCount = Number(recurringResult[0]?.count) || 0;

    // Get all budgets and calculate totals
    const userBudgets = await db.select().from(budgets).where(eq(budgets.userId, user.userId));
    const totalBudget = userBudgets.reduce((sum, b) => sum + b.amount, 0);

    // Calculate total spent per budget category
    let totalSpent = 0;
    let overBudgetCategories = 0;
    let topCategory = { name: "None", amount: 0 };

    for (const budget of userBudgets) {
      const expenseSum = await db
        .select({
          total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`.as('total')
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, user.userId),
            eq(expenses.category, budget.categoryId),
            gte(expenses.date, startOfMonth),
            lte(expenses.date, endOfMonth)
          )
        );
      
      const spent = expenseSum[0]?.total || 0;
      totalSpent += spent;
      
      if (spent > budget.amount) {
        overBudgetCategories++;
      }
      
      if (spent > topCategory.amount) {
        topCategory = { name: budget.categoryId, amount: spent };
      }
    }

    // Get categories count
    const userCategories = await db.select().from(categories).where(eq(categories.userId, user.userId));
    const categoriesCount = userCategories.length;

    const summary = {
      totalExpenses,
      totalBudget,
      totalSpent,
      budgetRemaining: Math.max(totalBudget - totalSpent, 0),
      categoriesCount,
      transactionsCount,
      recurringExpensesCount,
      topCategory,
      overBudgetCategories,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return NextResponse.json({ message: "Failed to fetch summary" }, { status: 500 });
  }
}
