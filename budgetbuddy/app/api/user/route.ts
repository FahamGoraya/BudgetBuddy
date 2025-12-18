import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { users, categories, expenses, budgets } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
    try {
        const allUsers = await db.select().from(users)
        return NextResponse.json(allUsers)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}

