"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { format, parseISO } from "date-fns";
import { BarChart3 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3" style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-amber-400 font-bold text-lg">${Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function MonthlyBarChart() {
  const { getMonthlyExpenses } = useExpenses();
  const data = getMonthlyExpenses().map((item) => ({
    ...item,
    monthLabel: format(parseISO(`${item.month}-01`), "MMM yyyy"),
  }));

  if (data.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Monthly Spending</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No monthly data available
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Monthly Spending</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="monthLabel" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
            <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
