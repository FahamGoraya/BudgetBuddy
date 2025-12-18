import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/db'
import { users, categories, expenses, budgets } from '@/app/db/schema'
import { eq } from 'drizzle-orm'


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try{
    const user = await db.select().from(users).where(eq(users.currency, "GBP"));
    if(user.length === 0){
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(user);

  }
  catch(error:any){
    return NextResponse.json(
      { error: error.message },
        { status: 500 }
    )
}

}