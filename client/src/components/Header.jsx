import React from 'react';
import { Wallet, Plus, Download, DollarSign } from 'lucide-react';

export default function Header({
  onOpenCreateModal,
  onExportCSV,
  currency,
  setCurrency
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-100">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">CodeNova</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Expense Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Task 2: Data Persistence & Summaries</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 text-xs font-semibold text-slate-700 rounded-xl border border-slate-200/80 outline-hidden hover:bg-slate-200/80 transition cursor-pointer"
            title="Display Currency"
          >
            <option value="$">USD ($)</option>
            <option value="₹">INR (₹)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Export transaction records to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Add Transaction */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
}
