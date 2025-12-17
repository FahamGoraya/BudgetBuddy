import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const expenses: Record<string, unknown>[] = [];

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const expense = expenses.find((e) => e.id === id);
  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json(expense);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  expenses[index] = { ...expenses[index], ...body };
  return NextResponse.json(expenses[index]);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  expenses.splice(index, 1);
  return NextResponse.json({ message: "Expense deleted" });
}
