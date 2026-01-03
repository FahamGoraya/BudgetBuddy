import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { expenses } from "@/app/db/schema";
import { getCurrentUser } from "@/app/lib/auth";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const expense = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.userId)))
      .limit(1);

    if (expense.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(expense[0]);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, description, category, date, recurring, recurringFrequency } = body;

    const updated = await db
      .update(expenses)
      .set({
        amount,
        description,
        category,
        date: date ? new Date(date) : undefined,
        recurring,
        recurringFrequency,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Expense deleted", id });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
