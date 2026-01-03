import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { expenses } from "@/app/db/schema";
import { getCurrentUser } from "@/app/lib/auth";
import { eq } from "drizzle-orm";


export async function GET(request: Request) {
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const userExpenses = await db.select().from(expenses).where(eq(expenses.userId, user.userId));
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
