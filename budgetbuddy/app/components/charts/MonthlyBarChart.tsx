"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { format, parseISO } from "date-fns";

export default function MonthlyBarChart() {
  const { getMonthlyExpenses } = useExpenses();
  const data = getMonthlyExpenses().map((item) => ({
    ...item,
    monthLabel: format(parseISO(`${item.month}-01`), "MMM yyyy"),
  }));

  if (data.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Monthly Spending</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No monthly data available
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Monthly Spending</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthLabel" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Bar dataKey="total" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
