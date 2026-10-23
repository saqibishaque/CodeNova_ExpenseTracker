import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { expenseApi } from './api/expenseApi';
import { useToast } from './context/ToastContext';
import Header from './components/Header';
import BalanceCards from './components/BalanceCards';
import CategoryBreakdown from './components/CategoryBreakdown';
import TransactionTable from './components/TransactionTable';
import TransactionFormModal from './components/TransactionFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { RefreshCw, AlertCircle, Plus } from 'lucide-react';

export default function App() {
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    transactionCount: 0,
    categoryBreakdown: []
  });
  const [categories, setCategories] = useState(['All']);
  const [currency, setCurrency] = useState('$');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // Refresh data from backend
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [fetchedTransactions, fetchedSummary, fetchedCategories] = await Promise.all([
        expenseApi.getTransactions(),
        expenseApi.getSummary(),
        expenseApi.getCategories()
      ]);

      setTransactions(fetchedTransactions);
      setSummary(fetchedSummary);
      setCategories(fetchedCategories);
      setIsServerOffline(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsServerOffline(true);
      showToast(
        'Unable to communicate with the expense server. Please ensure the backend is running.',
        'error',
        6000
      );
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Client-side instant filtering for responsiveness
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== 'All' && t.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = t.title && t.title.toLowerCase().includes(q);
        const inCategory = t.category && t.category.toLowerCase().includes(q);
        const inNotes = t.notes && t.notes.toLowerCase().includes(q);
        return inTitle || inCategory || inNotes;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  // Modal handlers
  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Create / Update Transaction Handler
  const handleSaveTransaction = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction) {
        await expenseApi.updateTransaction(editingTransaction.id, formData);
        showToast('Transaction updated successfully!', 'success');
      } else {
        await expenseApi.createTransaction(formData);
        showToast('Transaction logged successfully!', 'success');
      }

      handleCloseModal();
      // Reload fresh data and precise server-computed totals
      await loadData();
    } catch (err) {
      console.error('Failed to save transaction:', err);
      // Re-throw so modal can display error banner
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Transaction Handler
  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    setIsDeleting(true);
    try {
      await expenseApi.deleteTransaction(transactionToDelete.id);
      showToast('Transaction deleted.', 'success');
      setTransactionToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      showToast('Error deleting transaction: ' + err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export.', 'warning');
      return;
    }

    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.date,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CodeNova_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Transaction ledger exported to CSV.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        onOpenCreateModal={handleOpenCreateModal}
        onExportCSV={handleExportCSV}
        currency={currency}
        setCurrency={setCurrency}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Server Offline Warning */}
        {isServerOffline && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-sm font-medium">
                Unable to contact REST backend at <code className="bg-rose-100 px-1.5 py-0.5 rounded text-xs">http://localhost:5001/api/transactions</code>.
                Make sure the backend is running.
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Dynamic Balance Cards */}
        <BalanceCards summary={summary} currency={currency} />

        {/* Category Spending Breakdown Chart */}
        <CategoryBreakdown
          breakdown={summary.categoryBreakdown || []}
          totalExpenses={summary.totalExpenses}
          currency={currency}
        />

        {/* Interactive Transaction History Table */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Loading financial records...</p>
          </div>
        ) : (
          <TransactionTable
            transactions={filteredTransactions}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            onEdit={handleOpenEditModal}
            onDelete={setTransactionToDelete}
            currency={currency}
          />
        )}
      </main>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        isSubmitting={isSubmitting}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(transactionToDelete)}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={transactionToDelete ? transactionToDelete.title : ''}
        amount={transactionToDelete ? transactionToDelete.amount : 0}
        currency={currency}
        isDeleting={isDeleting}
      />
    </div>
  );
}
