import { NextResponse } from "next/server";

const categories = [
  { id: "1", name: "Food & Dining", color: "#FF6384" },
  { id: "2", name: "Transportation", color: "#36A2EB" },
  { id: "3", name: "Shopping", color: "#FFCE56" },
  { id: "4", name: "Entertainment", color: "#4BC0C0" },
  { id: "5", name: "Bills & Utilities", color: "#9966FF" },
  { id: "6", name: "Healthcare", color: "#FF9F40" },
  { id: "7", name: "Education", color: "#C9CBCF" },
  { id: "8", name: "Travel", color: "#7C4DFF" },
  { id: "9", name: "Other", color: "#607D8B" },
];

export async function GET() {
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newCategory = {
    id: crypto.randomUUID(),
    ...body,
  };
  categories.push(newCategory);
  return NextResponse.json(newCategory, { status: 201 });
}
