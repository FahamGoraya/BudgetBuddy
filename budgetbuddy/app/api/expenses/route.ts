import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { expenses } from "@/app/db/schema";
import { getCurrentUser } from "@/app/lib/auth";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import redisClient from "@/app/redis/redis";


export async function GET(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // If month/year specified, filter expenses
    if (year && month) {
      const startOfMonth = new Date(parseInt(year), parseInt(month), 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59, 999);
      
      const filteredExpenses = await db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, user.userId),
            gte(expenses.date, startOfMonth),
            lte(expenses.date, endOfMonth)
          )
        )
        .orderBy(desc(expenses.date));
      
      return NextResponse.json(filteredExpenses);
    }

    // Default: return all expenses (with caching)
    const cacheKey = `user:${user.userId}:expenses`;
    const cachedExpenses = await redisClient.get(cacheKey);
    if (cachedExpenses) {
      console.log("Returning cached expenses 1");
      return NextResponse.json(JSON.parse(cachedExpenses));
    }

    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, user.userId))
      .orderBy(desc(expenses.date));
    
    await redisClient.set(cacheKey, JSON.stringify(userExpenses), {
      EX: 300 // Cache for 5 minutes
    });
    return NextResponse.json(userExpenses);

  }
  catch (error) {
    console.error("Error fetching expenses:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch expenses" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  
}

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, description, category, date, recurring, recurringFrequency } = body;
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    


    await db.insert(expenses).values({
      userId: user.userId,
      amount,
      description,
      recurring,
      recurringFrequency,
      category,
      date: new Date(date),

    });

    const cacheKey = `user:${user.userId}:expenses`;
    await redisClient.del(cacheKey); // Invalidate cache
    const key = `user:${user.userId}:budgets`;
    await redisClient.del(key); // Invalidate budgets cache as well
    
    return NextResponse.json({ success: true, message: "Expense created successfully" } );

  }
  catch (error) {
    console.error("Error creating expense:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create expense" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: Request) {
  try{
    const user = getCurrentUser(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const body = await request.json();
    const { id } = body;
    const deleted = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.userId)))
      .returning();
    if (deleted.length === 0) {
      return new Response(
        JSON.stringify({ error: "Expense not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Invalidate cache so the next fetch gets fresh data
    const cacheKey = `user:${user.userId}:expenses`;
    const del = await redisClient.del(cacheKey);
    const key = `user:${user.userId}:budgets`;
    await redisClient.del(key); // Invalidate budgets cache as well
    
    return NextResponse.json({ message: "Expense deleted", success: true } );

  }
  catch (error) {
    console.error("Error deleting expense:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete expense" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

}
