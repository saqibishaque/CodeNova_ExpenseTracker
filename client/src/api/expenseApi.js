const API_BASE = '/api/transactions';

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Server returned unexpected response (${res.status} ${res.statusText})`);
  }

  if (!res.ok) {
    if (data && data.errors && Array.isArray(data.errors)) {
      throw new Error(data.errors.join(' '));
    }
    const errorMsg = data && data.message ? data.message : `HTTP error ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const expenseApi = {
  // Fetch transactions with filters
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const url = `${API_BASE}${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    const result = await handleResponse(res);
    return result.data || [];
  },

  // Fetch balance summary (Income, Expenses, Net Savings, Category Breakdown)
  async getSummary() {
    const res = await fetch(`${API_BASE}/summary`);
    const result = await handleResponse(res);
    return result.data;
  },

  // Fetch unique categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories/list`);
    const result = await handleResponse(res);
    return result.data || ['All'];
  },

  // Log a new transaction with dual-layer validation
  async createTransaction(transactionData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    const result = await handleResponse(res);
    return result.data;
  },

  // Update existing transaction
  async updateTransaction(id, transactionData) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    const result = await handleResponse(res);
    return result.data;
  },

  // Delete transaction
  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    const result = await handleResponse(res);
    return result.data;
  }
};
