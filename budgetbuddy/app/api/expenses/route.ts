import { NextResponse } from "next/server";

const expenses = [
  {
    id: "1",
    amount: 45.99,
    description: "Grocery shopping",
    category: "Food & Dining",
    date: "2025-12-15",
    isRecurring: false,
  },
  {
    id: "2",
    amount: 120.0,
    description: "Monthly bus pass",
    category: "Transportation",
    date: "2025-12-01",
    isRecurring: true,
    recurringFrequency: "monthly",
  },
];

export async function GET() {
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newExpense = {
    id: crypto.randomUUID(),
    ...body,
  };
  expenses.push(newExpense);
  return NextResponse.json(newExpense, { status: 201 });
}
