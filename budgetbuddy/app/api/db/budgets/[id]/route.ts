import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { budgets, categories } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [budget] = await db.select({
      id: budgets.id,
      limit: budgets.limit,
      spent: budgets.spent,
      month: budgets.month,
      userId: budgets.userId,
      categoryId: budgets.categoryId,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
      category: categories,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.id, params.id))

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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { limit, spent, month } = body

    await db.update(budgets)
      .set({
        limit,
        spent,
        month,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, params.id))

    const [budget] = await db.select({
      id: budgets.id,
      limit: budgets.limit,
      spent: budgets.spent,
      month: budgets.month,
      userId: budgets.userId,
      categoryId: budgets.categoryId,
      createdAt: budgets.createdAt,
      updatedAt: budgets.updatedAt,
      category: categories,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(eq(budgets.id, params.id))

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
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(budgets).where(eq(budgets.id, params.id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
