"use client";

import { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";

interface BudgetFormProps {
  onClose: () => void;
}

export default function BudgetForm({ onClose }: BudgetFormProps) {
  const { categories, addBudget, budgets } = useExpenses();
  const existingCategories = budgets.map((b) => b.category);
  const availableCategories = categories.filter((c) => !existingCategories.includes(c.name));

  const [formData, setFormData] = useState({
    category: availableCategories[0]?.name || "",
    limit: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget({
      category: formData.category,
      limit: parseFloat(formData.limit),
      spent: 0,
    });
    onClose();
  };

  if (availableCategories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Add New Budget</h2>
          <p className="text-gray-600 mb-4">All categories already have budgets assigned.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Budget</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {availableCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

