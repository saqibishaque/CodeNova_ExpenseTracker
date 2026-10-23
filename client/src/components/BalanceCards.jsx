import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function BalanceCards({
  summary,
  currency = '$'
}) {
  const { totalIncome = 0, totalExpenses = 0, netSavings = 0 } = summary;

  // Format currency with commas
  const formatAmount = (num) => {
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const isNetPositive = netSavings >= 0;
  const savingsRate = totalIncome > 0
    ? Math.round((netSavings / totalIncome) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 my-6">
      {/* 1. Total Income Card */}
      <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Income
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            <span className="text-emerald-600 mr-1">{currency}</span>
            {formatAmount(totalIncome)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Incoming revenue & salary</span>
          </div>
        </div>
      </div>

      {/* 2. Total Expenses Card */}
      <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Expenses
          </span>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            <span className="text-rose-600 mr-1">{currency}</span>
            {formatAmount(totalExpenses)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-rose-700">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Outgoing costs & bills</span>
          </div>
        </div>
      </div>

      {/* 3. Current Net Savings Card */}
      <div
        className={`relative overflow-hidden p-6 rounded-3xl border shadow-xs hover:shadow-md transition-all duration-200 ${
          isNetPositive
            ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border-indigo-900'
            : 'bg-gradient-to-br from-rose-950 via-slate-950 to-black text-white border-rose-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Net Savings Balance
          </span>
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300 border border-white/10">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className={isNetPositive ? 'text-indigo-400 mr-1' : 'text-rose-400 mr-1'}>
              {currency}
            </span>
            {formatAmount(netSavings)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-300 font-medium">
            <span
              className={`px-2 py-0.5 rounded-full font-semibold ${
                savingsRate >= 20
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : savingsRate >= 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {savingsRate}% Savings Rate
            </span>
            <span>{isNetPositive ? 'Healthy surplus' : 'Deficit'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
