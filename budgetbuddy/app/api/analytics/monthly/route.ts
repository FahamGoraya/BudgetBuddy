import { NextResponse } from "next/server";

export async function GET() {
  const monthlyData = [
    { month: "2025-10", total: 520.0, monthLabel: "Oct 2025" },
    { month: "2025-11", total: 485.0, monthLabel: "Nov 2025" },
    { month: "2025-12", total: 356.97, monthLabel: "Dec 2025" },
  ];

  return NextResponse.json(monthlyData);
}
