import React from 'react';
import { Search, Edit3, Trash2, ArrowUpRight, ArrowDownRight, Tag, Calendar, Filter } from 'lucide-react';

const CATEGORY_COLORS = {
  Salary: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Freelance: 'bg-teal-100 text-teal-800 border-teal-200',
  Investment: 'bg-blue-100 text-blue-800 border-blue-200',
  Bonus: 'bg-violet-100 text-violet-800 border-violet-200',
  'Food & Dining': 'bg-orange-100 text-orange-800 border-orange-200',
  Housing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Utilities: 'bg-amber-100 text-amber-800 border-amber-200',
  Transportation: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
  Health: 'bg-rose-100 text-rose-800 border-rose-200',
  Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
  Technology: 'bg-sky-100 text-sky-800 border-sky-200',
  Education: 'bg-lime-100 text-lime-800 border-lime-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function TransactionTable({
  transactions,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  onEdit,
  onDelete,
  currency = '$'
}) {
  const formatAmount = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, parseInt(month) - 1, day);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base">
            Transaction History
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
            {transactions.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold">
            {['All', 'expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg transition capitalize cursor-pointer ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'All' ? 'All' : t === 'expense' ? 'Expenses' : 'Income'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-white text-xs font-semibold text-slate-700 rounded-xl border border-slate-200 outline-hidden hover:bg-slate-50 transition cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories
              .filter((c) => c !== 'All')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      {transactions.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <p className="text-sm font-medium">No transactions found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => {
                  const isIncome = t.type === 'income';
                  const badgeStyle = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.Other;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6 font-medium text-slate-500 whitespace-nowrap text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(t.date)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">
                          {t.title}
                        </div>
                        {t.notes && (
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {t.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
                        >
                          <Tag className="w-3 h-3" />
                          {t.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-sm ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-rose-500" />
                          )}
                          <span>
                            {isIncome ? '+' : '-'} {currency}
                            {formatAmount(t.amount)}
                          </span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEdit(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Edit transaction"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              const badgeStyle = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.Other;

              return (
                <div key={t.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(t.date)}
                      </p>
                    </div>
                    <div
                      className={`font-extrabold text-sm whitespace-nowrap ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {currency}
                      {formatAmount(t.amount)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
                    >
                      <Tag className="w-3 h-3" />
                      {t.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
