import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { expenses, categories } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [expense] = await db.select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      isRecurring: expenses.isRecurring,
      recurringFrequency: expenses.recurringFrequency,
      userId: expenses.userId,
      categoryId: expenses.categoryId,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      category: categories,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.id, params.id))

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { description, amount, date, categoryId, isRecurring, recurringFrequency } = body

    await db.update(expenses)
      .set({
        description,
        amount,
        date: new Date(date),
        categoryId,
        isRecurring,
        recurringFrequency,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, params.id))

    const [expense] = await db.select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      isRecurring: expenses.isRecurring,
      recurringFrequency: expenses.recurringFrequency,
      userId: expenses.userId,
      categoryId: expenses.categoryId,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
      category: categories,
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.id, params.id))

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(expenses).where(eq(expenses.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
