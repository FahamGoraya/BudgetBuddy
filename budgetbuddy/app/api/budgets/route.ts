import { NextResponse } from "next/server";

const budgets = [
  { id: "1", category: "Food & Dining", limit: 500, spent: 245.99 },
  { id: "2", category: "Transportation", limit: 200, spent: 120.0 },
  { id: "3", category: "Shopping", limit: 300, spent: 189.99 },
  { id: "4", category: "Entertainment", limit: 150, spent: 65.99 },
];

export async function GET() {
  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newBudget = {
    id: crypto.randomUUID(),
    ...body,
  };
  budgets.push(newBudget);
  return NextResponse.json(newBudget, { status: 201 });
}
