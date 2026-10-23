# CodeNova Full Stack Internship — Task 2: Expense Tracker

[![Internship Track](https://img.shields.io/badge/Track-Full_Stack_Development-blue.svg)](https://codenova.community)
[![Batch](https://img.shields.io/badge/Batch-01_Remote-indigo.svg)](https://codenova.community)
[![Task](https://img.shields.io/badge/Task_2-Expense_Tracker-success.svg)](https://codenova.community)
[![Stack](https://img.shields.io/badge/Stack-React_19_+_Express_+_SQLite-purple.svg)](https://codenova.community)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-grade, full-stack Financial Management and Expense Tracking application built to fulfill **Task 2** of the **CodeNova Remote Internship Program (Batch 01)**. Engineered with dual-layer transaction validation (client and server), dynamic balance aggregation cards, persistent SQLite storage, real-time filtering, responsive mobile-desktop layout, and instant CSV ledger export.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Database Schema & Design](#-database-schema--design)
5. [RESTful API Contract & Endpoints](#-restful-api-contract--endpoints)
6. [Dual-Layer Validation Architecture](#-dual-layer-validation-architecture)
7. [Prerequisites & Quick Setup](#-prerequisites--quick-setup)
8. [Running the Application](#-running-the-application)
9. [Acceptance Criteria Verification](#-acceptance-criteria-verification)
10. [Submission Checklist](#-submission-checklist)

---

## 🎯 Project Overview

- **Objective**: Create a persistent, full-stack expense tracker with categories, transaction logs, dynamic financial summaries, and strict dual-layer validation.
- **Frontend Stack**: React 19, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend Stack**: Node.js, Express, SQLite 3 (`sqlite3`), Morgan, CORS, Dotenv.
- **Database**: SQLite with indexed tables and constraint checks ensuring data survives server restarts.
- **Zero Paid Tooling**: 100% open-source local stack requiring zero paid subscriptions or proprietary APIs.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Dynamic Balance Cards** | Real-time calculations of **Total Income**, **Total Expenses**, and **Net Savings** with dynamic savings rate indicators. |
| **Exact Mathematical Sync** | Dashboard balances are computed by server-side SQL aggregate functions (`SUM`, `CASE`) guaranteeing precision. |
| **Dual-Layer Validation** | Client-side reactive input validation backed by strict server-side middleware rejecting malformed amounts, dates, or missing fields with `HTTP 400`. |
| **Interactive History Ledger** | Filterable transaction table with category badges, color-coded amount indicators (`+$` / `-$`), and safe delete actions. |
| **Category Distribution Breakdown** | Real-time category-by-category spending distribution bars with percentages and counts. |
| **Currency Switching** | Instant toggle between USD (`$`), INR (`₹`), EUR (`€`), and GBP (`£`). |
| **Export to CSV** | One-click export downloading the entire transaction record history as a formatted CSV spreadsheet. |
| **Mobile-First Responsive Layout** | Smooth adaptation from a comprehensive data table on desktop to stacked cards on mobile screens. |

---

## 🏗 Architecture & Folder Structure

```
codenova-expense-tracker/
├── package.json              # Monorepo root with concurrent dev orchestrator
├── .gitignore                # Git exclusions (database files, node_modules, logs)
├── README.md                 # Project handbook & submission guide
│
├── server/                   # Backend REST API Service
│   ├── package.json          # Express, SQLite3, CORS dependencies
│   ├── .env.example          # Environment variable template
│   ├── .env                  # Local server environment configuration (Port 5001)
│   ├── expenses.db           # Persistent SQLite database file
│   └── src/
│       ├── index.js          # Express app entrypoint & error handler
│       ├── database.js       # SQLite connection & schema initialization
│       ├── schema.sql        # Pure SQL schema definition & indexes
│       ├── routes/
│       │   └── transactions.js # REST API routes & validation middleware
│       └── scripts/
│           └── seed.js       # Database seeder with sample financial transactions
│
└── client/                   # Frontend React Application
    ├── package.json          # React 19, Tailwind CSS v4, Lucide dependencies
    ├── vite.config.js        # Vite config with backend /api proxy (Port 5174)
    ├── index.html            # HTML document template
    └── src/
        ├── main.jsx          # React DOM entrypoint & ToastProvider
        ├── App.jsx           # Main application state, financial math sync & filters
        ├── index.css         # Modern Tailwind v4 styles
        ├── api/
        │   └── expenseApi.js # Fetch client for all backend REST endpoints
        ├── context/
        │   └── ToastContext.jsx # Toast notification alert system
        └── components/
            ├── Header.jsx    # Logo, currency picker, CSV export, log transaction CTA
            ├── BalanceCards.jsx # Income, Expenses & Net Savings summary cards
            ├── CategoryBreakdown.jsx # Spending distribution bars by category
            ├── TransactionTable.jsx # Responsive history table & mobile list
            ├── TransactionFormModal.jsx # Create/Edit modal with dual-layer validation
            └── DeleteConfirmModal.jsx # Deletion confirmation modal
```

---

## 🗄 Database Schema & Design

The database schema is defined in `server/src/schema.sql` and enforced automatically upon server startup:

```sql
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

-- Performance Indexes for Fast Filtering & Aggregation
CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_trans_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_trans_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_trans_created ON transactions(created_at);
```

---

## 📡 RESTful API Contract & Endpoints

| Method | Endpoint | Description | Query / Body | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | — | `200 OK` |
| `GET` | `/api/transactions` | Retrieve all transactions with filters | `?type=...&category=...&search=...` | `200 OK` |
| `GET` | `/api/transactions/summary` | Precise server-computed financial balances | — | `200 OK` |
| `GET` | `/api/transactions/categories/list` | List of unique transaction categories | — | `200 OK` |
| `GET` | `/api/transactions/:id` | Fetch single transaction | — | `200 OK`, `404 Not Found` |
| `POST` | `/api/transactions` | Log new transaction (Server Validated) | JSON: `{ title, amount, type, category, date, notes }` | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/transactions/:id` | Update transaction (Server Validated) | JSON: `{ title, amount, type, category, date, notes }` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/transactions/:id` | Delete transaction permanently | — | `200 OK`, `404 Not Found` |

### Sample cURL Requests

**1. Log a New Expense:**
```bash
curl -X POST http://localhost:5001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"title":"Grocery Superstore","amount":142.50,"type":"expense","category":"Food & Dining","date":"2026-10-23"}'
```

**2. Query Summary Balances:**
```bash
curl -X GET http://localhost:5001/api/transactions/summary
```

---

## 🛡 Dual-Layer Validation Architecture

1. **Client-Side Validation (Layer 1)**:
   - Instant visual cues and disabled submission if title is under 3 characters.
   - Strictly validates amount as positive decimal number (`> 0`).
   - Format validation on date (`YYYY-MM-DD`).

2. **Server-Side Validation (Layer 2 - Independent Protection)**:
   - Express middleware (`validateTransaction`) parses and verifies payload types independently.
   - Rejects non-numeric, zero, or negative amounts with informative `400 Bad Request`.
   - Rejects illegal types (only `'income'` or `'expense'` accepted).
   - Rejects unparseable date strings.

---

## ⚙️ Prerequisites & Quick Setup

### Requirements
- **Node.js**: v18.0.0 or later (v20+ or v24+ recommended)
- **npm**: v9.0.0 or later

### Quick Setup

1. **Navigate to the repository folder:**
   ```bash
   cd codenova-expense-tracker
   ```

2. **Install all dependencies across root, server, and client:**
   ```bash
   npm run install:all
   ```

3. **Seed initial sample transactions (Income & Expenses):**
   ```bash
   npm run seed
   ```

---

## 🚀 Running the Application

### Option A: Run Both Client & Server Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Backend API**: Running at `http://localhost:5001`
- **Frontend App**: Running at `http://localhost:5174`

### Option B: Run Services Separately
- **Start Backend**:
  ```bash
  cd server
  npm run dev
  ```
- **Start Frontend**:
  ```bash
  cd client
  npm run dev
  ```

---

## ✅ Acceptance Criteria Verification

| CodeNova Requirement | Implementation Evidence | Status |
| :--- | :--- | :---: |
| **Dynamic Balance Cards** | BalanceCards component displays Total Income, Total Expenses, and Net Savings with live savings rate. | **PASSED** |
| **Exact Mathematical Precision** | Calculations performed directly via SQLite SQL aggregates (`/api/transactions/summary`) and synced to UI. | **PASSED** |
| **Dual-Layer Validation** | Validated on React input fields and reinforced via server middleware returning HTTP 400 on violations. | **PASSED** |
| **Interactive Table & Deletion** | Filterable table with category color badges, responsive mobile cards, and deletion confirmation modal. | **PASSED** |
| **Database Persistence** | SQLite database file (`expenses.db`) ensures all logged records persist indefinitely across server restarts. | **PASSED** |
| **Mobile & Desktop Responsive** | Tailwind layout scales smoothly from multi-column tables on desktop to card views on mobile. | **PASSED** |

---

## 📌 Submission Checklist for Interns

- [x] Full-stack source code organized cleanly in monorepo.
- [x] SQLite database schema defined in `schema.sql` and initialized programmatically.
- [x] Zero paid tools used (100% free local SQLite + Express + React).
- [x] Database seeder script included (`npm run seed`).
- [x] No secrets or credentials in repository.
- [ ] Push codebase to a public GitHub repository named `codenova-expense-tracker`.
- [ ] Submit both **Task 1** and **Task 2** links via the official CodeNova Google Form to fulfill the mandatory 2-task requirement!
