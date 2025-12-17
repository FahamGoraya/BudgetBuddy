"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { format, parseISO, startOfDay } from "date-fns";

export default function SpendingTrendChart() {
  const { expenses } = useExpenses();

  const dailyData = expenses.reduce((acc: Record<string, number>, expense) => {
    const day = startOfDay(parseISO(expense.date)).toISOString().split("T")[0];
    acc[day] = (acc[day] || 0) + expense.amount;
    return acc;
  }, {});

  const data = Object.entries(dailyData)
    .map(([date, amount]) => ({
      date,
      amount,
      dateLabel: format(parseISO(date), "MMM dd"),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Spending Trend (Last 14 Days)</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No spending data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Spending Trend (Last 14 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateLabel" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ fill: "#6366F1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
