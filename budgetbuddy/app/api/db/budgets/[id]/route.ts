import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { budgets, categories } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [budget] = await db.select({
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
    .where(eq(budgets.id, id))

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(budget)
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
    const { amount, spent, period } = body

    await db.update(budgets)
      .set({
        amount,
        spent,
        period,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, id))

    const [budget] = await db.select({
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
    .where(eq(budgets.id, id))

    return NextResponse.json(budget)
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
    await db.delete(budgets).where(eq(budgets.id, id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
