const { initSchema, dbQuery, db } = require('../database');

const sampleTransactions = [
  {
    title: 'Software Engineer Monthly Salary',
    amount: 4500.00,
    type: 'income',
    category: 'Salary',
    date: '2026-10-01',
    notes: 'Direct deposit from CodeNova tech team'
  },
  {
    title: 'Freelance Web Design Project',
    amount: 1200.00,
    type: 'income',
    category: 'Freelance',
    date: '2026-10-12',
    notes: 'Landing page revamp milestone 2'
  },
  {
    title: 'Apartment Monthly Rent',
    amount: 1200.00,
    type: 'expense',
    category: 'Housing',
    date: '2026-10-02',
    notes: 'Electronic transfer to landlord'
  },
  {
    title: 'Whole Foods Market Groceries',
    amount: 285.50,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-05',
    notes: 'Bi-weekly meal prep essentials'
  },
  {
    title: 'Electric & Water Utilities',
    amount: 145.20,
    type: 'expense',
    category: 'Utilities',
    date: '2026-10-08',
    notes: 'City power & water statement'
  },
  {
    title: 'High-Speed Fiber Internet',
    amount: 65.00,
    type: 'expense',
    category: 'Utilities',
    date: '2026-10-10',
    notes: 'Gigabit fiber connection'
  },
  {
    title: 'Cloud VPS & Domain Renewal',
    amount: 45.00,
    type: 'expense',
    category: 'Technology',
    date: '2026-10-15',
    notes: 'Dev server hosting'
  },
  {
    title: 'Weekend Dining & Espresso',
    amount: 88.40,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-10-18',
    notes: 'Brunch with team'
  },
  {
    title: 'Monthly Gym & Fitness Pass',
    amount: 55.00,
    type: 'expense',
    category: 'Health',
    date: '2026-10-20',
    notes: 'Fitness club membership'
  }
];

async function seed() {
  console.log('🌱 Seeding Expense Tracker database...');
  try {
    await initSchema();

    const existing = await dbQuery.get('SELECT COUNT(*) as count FROM transactions');
    if (existing.count > 0) {
      console.log(`ℹ️ Database already contains ${existing.count} transactions. Clearing before re-seeding...`);
      await dbQuery.run('DELETE FROM transactions');
      await dbQuery.run("DELETE FROM sqlite_sequence WHERE name='transactions'");
    }

    const now = new Date().toISOString();
    for (const item of sampleTransactions) {
      await dbQuery.run(
        `INSERT INTO transactions (title, amount, type, category, date, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.title, item.amount, item.type, item.category, item.date, item.notes, now, now]
      );
    }

    console.log(`✅ Successfully seeded ${sampleTransactions.length} sample transactions!`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    db.close();
  }
}

seed();
