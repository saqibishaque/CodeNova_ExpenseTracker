-- =====================================================================
-- CodeNova Internship Program • Task 2: Expense Tracker
-- Database Schema Definition (SQLite)
-- =====================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK(length(trim(title)) > 0),
    amount REAL NOT NULL CHECK(amount > 0),
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    category TEXT NOT NULL CHECK(length(trim(category)) > 0),
    date TEXT NOT NULL CHECK(length(trim(date)) >= 10),
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_trans_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_trans_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_trans_created ON transactions(created_at);
