import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { budgets, categories, expenses } from '@/app/db/schema'
import { eq, and, sum } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const result = await db.select({
      id: budgets.id,
      amount: budgets.amount,
      spent: budgets.spent,
      period: budgets.period,
      userId: budgets.userId,
      categoryId: budgets.categoryId,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
      category: categories,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.userId, userId))

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, period, categoryId, userId } = body

    const expenseSum = await db.select({
      total: sum(expenses.amount),
    })
    .from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      eq(expenses.categoryId, categoryId)
    ))

    const spent = Number(expenseSum[0]?.total || 0)

    const [budget] = await db.insert(budgets).values({
      amount,
      spent,
      period,
      categoryId,
      userId,
    }).returning()

    const [budgetWithCategory] = await db.select({
      id: budgets.id,
      amount: budgets.amount,
      spent: budgets.spent,
      period: budgets.period,
      userId: budgets.userId,
      categoryId: budgets.categoryId,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
      category: categories,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.id, budget.id))

    return NextResponse.json(budgetWithCategory)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
