import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { db } from "@/app/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { budgets, expenses } from "@/app/db/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to get current month date range
function getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const budget = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, id),
          eq(budgets.userId, user.userId)
        )
      );

    if (budget.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Calculate spent amount from expenses
    const { startOfMonth, endOfMonth } = getCurrentMonthRange();
    const expenseSum = await db
      .select({
        total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`.as('total')
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, user.userId),
          eq(expenses.category, budget[0].categoryId),
          gte(expenses.date, startOfMonth),
          lte(expenses.date, endOfMonth)
        )
      );

    const result = {
      id: budget[0].id,
      category: budget[0].categoryId,
      limit: budget[0].amount,
      spent: expenseSum[0]?.total || 0,
      period: budget[0].period,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json({ message: "Failed to fetch budget" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if budget exists and belongs to user
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, id),
          eq(budgets.userId, user.userId)
        )
      );

    if (existingBudget.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Build update object
    const updateData: { amount?: number; categoryId?: string; period?: string } = {};
    if (body.limit !== undefined) updateData.amount = body.limit;
    if (body.category !== undefined) updateData.categoryId = body.category;
    if (body.period !== undefined) updateData.period = body.period;

    const updated = await db
      .update(budgets)
      .set(updateData)
      .where(eq(budgets.id, id))
      .returning();

    const result = {
      id: updated[0].id,
      category: updated[0].categoryId,
      limit: updated[0].amount,
      spent: updated[0].spent,
      period: updated[0].period,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json({ message: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if budget exists and belongs to user
    const existingBudget = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.id, id),
          eq(budgets.userId, user.userId)
        )
      );

    if (existingBudget.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    await db.delete(budgets).where(eq(budgets.id, id));

    return NextResponse.json({ message: "Budget deleted", success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json({ message: "Failed to delete budget" }, { status: 500 });
  }
}
