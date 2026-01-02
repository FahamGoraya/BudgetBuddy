"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useExpenses } from "../../context/ExpenseContext";
import { PieChart as PieIcon } from "lucide-react";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3" style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
        <p className="text-white font-medium">{payload[0].name}</p>
        <p className="text-emerald-400 font-bold">${Number(payload[0].value).toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function ExpensePieChart() {
  const { getExpensesByCategory } = useExpenses();
  const data = getExpensesByCategory();

  if (data.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <PieIcon className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Expenses by Category</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No expense data available
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <PieIcon className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Expenses by Category</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-gray-300">{value}</span>}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
