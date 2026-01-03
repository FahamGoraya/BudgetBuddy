import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { expenses, categories } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [expense] = await db.select({
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
    .where(eq(expenses.id, id))

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { description, amount, date, categoryId } = body

    await db.update(expenses)
      .set({
        description,
        amount,
        date: new Date(date),
        categoryId,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))

    const [expense] = await db.select({
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
    .where(eq(expenses.id, id))

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.delete(expenses).where(eq(expenses.id, id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
