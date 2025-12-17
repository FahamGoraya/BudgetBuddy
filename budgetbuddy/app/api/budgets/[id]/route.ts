import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const budgets: Record<string, unknown>[] = [];

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const budget = budgets.find((b) => b.id === id);
  if (!budget) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }
  return NextResponse.json(budget);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const index = budgets.findIndex((b) => b.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }
  budgets[index] = { ...budgets[index], ...body };
  return NextResponse.json(budgets[index]);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const index = budgets.findIndex((b) => b.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Budget not found" }, { status: 404 });
  }
  budgets.splice(index, 1);
  return NextResponse.json({ message: "Budget deleted" });
}
