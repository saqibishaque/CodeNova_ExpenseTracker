const express = require('express');
const router = express.Router();
const { dbQuery } = require('../database');

/**
 * Robust date validation helper
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  // Match YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validation middleware for creating & updating transactions
 */
function validateTransaction(req, res, next) {
  const { title, amount, type, category, date } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Transaction title/description is required.');
  }

  // Amount validation (strictly positive number)
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    errors.push('Amount must be a valid positive number greater than zero.');
  }

  // Type validation
  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    errors.push("Type must be either 'income' or 'expense'.");
  }

  // Category validation
  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('A valid category is required.');
  }

  // Date validation
  if (!date || !isValidDate(date)) {
    errors.push('A valid date in YYYY-MM-DD format is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Server-side validation failed.',
      errors
    });
  }

  // Sanitize and attach normalized values
  req.sanitized = {
    title: title.trim(),
    amount: Math.round(numAmount * 100) / 100, // round to 2 decimals
    type: type.toLowerCase(),
    category: category.trim(),
    date: date.trim(),
    notes: req.body.notes ? String(req.body.notes).trim() : ''
  };

  next();
}

// GET /api/transactions - Fetch with filtering & sorting
router.get('/', async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      query += ' AND type = ?';
      params.push(type.toLowerCase());
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (title LIKE ? OR category LIKE ? OR notes LIKE ?)';
      params.push(term, term, term);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const transactions = await dbQuery.all(query, params);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/summary - Precise server-side balance & summary calculations
router.get('/summary', async (req, res, next) => {
  try {
    const summaryQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COUNT(*) AS transactionCount
      FROM transactions;
    `;

    const summary = await dbQuery.get(summaryQuery);

    const totalIncome = Math.round((summary.totalIncome || 0) * 100) / 100;
    const totalExpenses = Math.round((summary.totalExpenses || 0) * 100) / 100;
    const netSavings = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // Category breakdown for expenses
    const categoryQuery = `
      SELECT category, type, SUM(amount) AS totalAmount, COUNT(*) AS count
      FROM transactions
      GROUP BY category, type
      ORDER BY totalAmount DESC;
    `;
    const categoryRows = await dbQuery.all(categoryQuery);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netSavings,
        transactionCount: summary.transactionCount,
        categoryBreakdown: categoryRows
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/categories/list - Unique categories list
router.get('/categories/list', async (req, res, next) => {
  try {
    const rows = await dbQuery.all('SELECT DISTINCT category FROM transactions WHERE category IS NOT NULL');
    const categories = ['All', ...new Set(rows.map(r => r.category).filter(Boolean))];
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/:id - Fetch single transaction
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await dbQuery.get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Transaction #${id} not found.`
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions - Create new transaction with dual-layer server validation
router.post('/', validateTransaction, async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes } = req.sanitized;
    const now = new Date().toISOString();

    const result = await dbQuery.run(
      `INSERT INTO transactions (title, amount, type, category, date, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, amount, type, category, date, notes, now, now]
    );

    const created = await dbQuery.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);

    res.status(201).json({
      success: true,
      message: 'Transaction logged successfully.',
      data: created
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', validateTransaction, async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await dbQuery.get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Transaction #${id} not found.`
      });
    }

    const { title, amount, type, category, date, notes } = req.sanitized;
    const now = new Date().toISOString();

    await dbQuery.run(
      `UPDATE transactions
       SET title = ?, amount = ?, type = ?, category = ?, date = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [title, amount, type, category, date, notes, now, id]
    );

    const updated = await dbQuery.get('SELECT * FROM transactions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Transaction updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await dbQuery.get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Transaction #${id} not found.`
      });
    }

    await dbQuery.run('DELETE FROM transactions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Transaction deleted successfully.',
      data: existing
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
