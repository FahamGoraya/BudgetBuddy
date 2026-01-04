import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { db } from "@/app/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { budgets, expenses } from "@/app/db/schema";

// Helper to get current month date range
function getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
}

// GET - Fetch all budgets with calculated spent amounts
export async function GET(request: Request) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all budgets for the user
        const userBudgets = await db.select().from(budgets).where(eq(budgets.userId, user.userId));

        // Get current month date range
        const { startOfMonth, endOfMonth } = getCurrentMonthRange();

        // Calculate spent amount for each budget by summing expenses in the category
        const budgetsWithSpent = await Promise.all(
            userBudgets.map(async (budget) => {
                // Sum expenses for this category in the current month
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

                return {
                    id: budget.id,
                    category: budget.categoryId,
                    limit: budget.amount,
                    spent: spent,
                    period: budget.period,
                };
            })
        );

        return NextResponse.json(budgetsWithSpent, { status: 200 });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        return NextResponse.json({ message: "Failed to fetch budgets" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { category, limit, spent } = body;
    if (!category || limit === undefined) {
        return NextResponse.json({ message: "Invalid budget data" }, { status: 400 });
    }
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        // Check if budget for this category already exists
        const existingBudget = await db
            .select()
            .from(budgets)
            .where(
                and(
                    eq(budgets.userId, user.userId),
                    eq(budgets.categoryId, category)
                )
            );

        if (existingBudget.length > 0) {
            return NextResponse.json({ message: "Budget for this category already exists" }, { status: 400 });
        }

        const budgetData = {
            userId: user.userId,
            categoryId: category,
            amount: limit,
            spent: spent || 0,
            period: "monthly",
        };

        const add = await db.insert(budgets).values(budgetData).returning();

        // Return in the format expected by frontend
        const newBudget = {
            id: add[0].id,
            category: add[0].categoryId,
            limit: add[0].amount,
            spent: add[0].spent,
            period: add[0].period,
        };

        return NextResponse.json({ message: "Budget created", success: true, budget: newBudget }, { status: 201 });
    } catch (error) {
        console.error("Error creating budget:", error);
        return NextResponse.json({ message: "Failed to create budget" }, { status: 500 });
    }
}
