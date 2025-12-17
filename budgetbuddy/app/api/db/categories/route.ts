import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { categories } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

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

    const result = await db.select()
      .from(categories)
      .where(eq(categories.userId, userId))

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
    const { name, color, userId } = body

    const [category] = await db.insert(categories).values({
      name,
      color,
      userId,
    }).returning()

    return NextResponse.json(category)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
