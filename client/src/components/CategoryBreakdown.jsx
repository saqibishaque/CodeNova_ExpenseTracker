import React from 'react';
import { PieChart } from 'lucide-react';

export default function CategoryBreakdown({
  breakdown = [],
  totalExpenses = 0,
  currency = '$'
}) {
  const expenseBreakdown = breakdown.filter((item) => item.type === 'expense');

  if (expenseBreakdown.length === 0 || totalExpenses <= 0) {
    return null;
  }

  const formatAmount = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Expense Distribution by Category
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown computed automatically by backend SQLite engine
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenseBreakdown.map((item) => {
          const pct = Math.round((item.totalAmount / totalExpenses) * 100);
          return (
            <div
              key={item.category}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">{item.category}</span>
                <span className="text-slate-900 font-bold">
                  {currency}
                  {formatAmount(item.totalAmount)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 font-medium text-right mt-1.5">
                {pct}% of expenses ({item.count} {item.count === 1 ? 'record' : 'records'})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
