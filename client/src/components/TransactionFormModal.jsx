import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gifts', 'Other'];
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Health',
  'Shopping',
  'Technology',
  'Education',
  'Other'
];

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isSubmitting = false,
  currency = '$'
}) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(initialData.category || (initialData.type === 'income' ? 'Salary' : 'Food & Dining'));
      setDate(initialData.date ? initialData.date.substring(0, 10) : new Date().toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  // Adjust default category when type toggles
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      if (!INCOME_CATEGORIES.includes(category)) setCategory('Salary');
    } else {
      if (!EXPENSE_CATEGORIES.includes(category)) setCategory('Food & Dining');
    }
  };

  if (!isOpen) return null;

  // Client-side Validation (Layer 1)
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title / Description is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid numeric amount.';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be strictly greater than 0.';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      newErrors.date = 'Invalid date format (must be YYYY-MM-DD).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    try {
      await onSave({
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category: category.trim(),
        date: date.trim(),
        notes: notes.trim()
      });
    } catch (err) {
      setServerError(err.message || 'Server rejected transaction.');
    }
  };

  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Transaction' : 'Log New Transaction'}
            </h2>
            <p className="text-xs text-slate-500">
              Dual-layer validated financial entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Type Switcher (Income vs Expense) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Title / Description *
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly Salary, Grocery store, Office supplies..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border focus:outline-hidden transition ${
                errors.title
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.title}</p>
            )}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
                  }}
                  className={`w-full pl-8 pr-3.5 py-2.5 text-sm font-bold bg-slate-50 rounded-xl border focus:outline-hidden transition ${
                    errors.amount
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 rounded-xl border focus:outline-hidden transition ${
                    errors.date
                      ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Category *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    category === cat
                      ? type === 'income'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.category}</p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Additional payment details, invoice ref, or memo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition cursor-pointer disabled:opacity-50 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
              }`}
            >
              {isSubmitting
                ? 'Saving...'
                : initialData
                ? 'Update Record'
                : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
