import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { expenses, budgets, categories } from '@/app/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

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
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      userId: expenses.userId,
      categoryId: expenses.categoryId,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      category: categories,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.date))

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
    const { description, amount, date, categoryId, userId } = body

    const [expense] = await db.insert(expenses).values({
      description,
      amount,
      date: new Date(date),
      categoryId,
      userId,
    }).returning()

    const [expenseWithCategory] = await db.select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      userId: expenses.userId,
      categoryId: expenses.categoryId,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      category: categories,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.id, expense.id))

    return NextResponse.json(expenseWithCategory)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
