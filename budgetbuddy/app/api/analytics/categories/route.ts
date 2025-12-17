import { NextResponse } from "next/server";

export async function GET() {
  const categoryBreakdown = [
    { name: "Food & Dining", value: 245.99, color: "#FF6384", percentage: 29.2 },
    { name: "Transportation", value: 120.0, color: "#36A2EB", percentage: 14.3 },
    { name: "Shopping", value: 89.99, color: "#FFCE56", percentage: 10.7 },
    { name: "Entertainment", value: 15.99, color: "#4BC0C0", percentage: 1.9 },
    { name: "Bills & Utilities", value: 85.0, color: "#9966FF", percentage: 10.1 },
    { name: "Healthcare", value: 200.0, color: "#FF9F40", percentage: 23.8 },
    { name: "Education", value: 35.0, color: "#C9CBCF", percentage: 4.2 },
    { name: "Travel", value: 250.0, color: "#7C4DFF", percentage: 29.7 },
  ];

  return NextResponse.json(categoryBreakdown);
}
