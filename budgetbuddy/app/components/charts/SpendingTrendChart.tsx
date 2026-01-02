"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { format, parseISO, startOfDay } from "date-fns";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3" style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-emerald-400 font-bold text-lg">${Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

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
      <div>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-lime-400" />
          <h3 className="text-lg font-semibold text-white">Spending Trend (Last 14 Days)</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No spending data available
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-5 h-5 text-lime-400" />
        <h3 className="text-lg font-semibold text-white">Spending Trend (Last 14 Days)</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84cc16" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#84cc16" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="dateLabel" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#84cc16"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={{ fill: "#84cc16", stroke: "#84cc16", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#84cc16", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
