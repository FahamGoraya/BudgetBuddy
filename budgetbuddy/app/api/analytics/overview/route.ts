import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { db } from "@/app/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { budgets, expenses, financialPlan } from "@/app/db/schema";

// Helper to get date range for a specific month
function getMonthRange(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth();
    
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    return { startOfMonth, endOfMonth, targetYear, targetMonth };
}

// GET - Fetch monthly overview for sidebar
export async function GET(request: Request) {
    const user = await getCurrentUser(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
        
        const { startOfMonth, endOfMonth, targetYear, targetMonth } = getMonthRange(year, month);

        // Get total expenses for the month
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
        const expenseCount = totalExpensesResult[0]?.count || 0;

        // Get all budgets and calculate total budget limit
        const userBudgets = await db.select().from(budgets).where(eq(budgets.userId, user.userId));
        const totalBudgetLimit = userBudgets.reduce((sum, b) => sum + b.amount, 0);

        // Calculate spent for each budget
        let totalSpent = 0;
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
            totalSpent += expenseSum[0]?.total || 0;
        }

        // Get financial plan for income info
        const [plan] = await db
            .select()
            .from(financialPlan)
            .where(eq(financialPlan.userId, user.userId));

        const monthlyIncome = plan?.monthlyIncome || 0;
        const currency = plan?.currency || 'USD';

        // Calculate budget usage percentage
        const budgetUsedPercentage = totalBudgetLimit > 0 
            ? Math.min(Math.round((totalSpent / totalBudgetLimit) * 100), 100)
            : 0;

        // Get previous month for comparison
        const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1;
        const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;
        const { startOfMonth: prevStart, endOfMonth: prevEnd } = getMonthRange(prevYear, prevMonth);

        const prevExpensesResult = await db
            .select({
                total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`.as('total')
            })
            .from(expenses)
            .where(
                and(
                    eq(expenses.userId, user.userId),
                    gte(expenses.date, prevStart),
                    lte(expenses.date, prevEnd)
                )
            );

        const prevTotalExpenses = prevExpensesResult[0]?.total || 0;
        const expenseChange = prevTotalExpenses > 0 
            ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                month: new Date(targetYear, targetMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                totalExpenses,
                expenseCount,
                totalBudgetLimit,
                totalSpent,
                budgetUsedPercentage,
                budgetRemaining: Math.max(totalBudgetLimit - totalSpent, 0),
                monthlyIncome,
                currency,
                expenseChange, // Percentage change from previous month
                hasBudgets: userBudgets.length > 0,
                budgetCount: userBudgets.length
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching monthly overview:", error);
        return NextResponse.json({ message: "Failed to fetch monthly overview" }, { status: 500 });
    }
}
