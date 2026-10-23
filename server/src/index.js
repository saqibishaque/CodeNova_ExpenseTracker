const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initSchema } = require('./database');
const transactionsRouter = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/transactions', transactionsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CodeNova Expense Tracker API'
  });
});

// Welcome root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CodeNova Expense Tracker API (Task 2)',
    endpoints: {
      transactions: '/api/transactions',
      summary: '/api/transactions/summary',
      health: '/api/health'
    }
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

// Start Server
async function startServer() {
  try {
    await initSchema();
    app.listen(PORT, () => {
      console.log(`🚀 CodeNova Expense Server running at http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
