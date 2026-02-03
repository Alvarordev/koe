import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("koe.db", { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

export async function initializeDatabase(): Promise<void> {
    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'PEN',
      balance REAL NOT NULL DEFAULT 0,
      bank_name TEXT,
      account_number TEXT,
      cci TEXT,
      auto_fill_enabled INTEGER NOT NULL DEFAULT 0,
      auto_fill_amount REAL,
      auto_fill_day INTEGER,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'PEN',
      billing_day INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'MANUAL',
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      borrower_name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'PEN',
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      interest_rate REAL,
      description TEXT,
      loan_date TEXT NOT NULL,
      due_date TEXT,
      paid_amount REAL NOT NULL DEFAULT 0,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS loan_payments (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      note TEXT,
      loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY,
      lender_name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'PEN',
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      interest_rate REAL,
      description TEXT,
      debt_date TEXT NOT NULL,
      due_date TEXT,
      paid_amount REAL NOT NULL DEFAULT 0,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE TABLE IF NOT EXISTS debt_payments (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      note TEXT,
      debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

    await expoDb.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_account ON subscriptions(account_id);
    CREATE INDEX IF NOT EXISTS idx_loans_account ON loans(account_id);
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
    CREATE INDEX IF NOT EXISTS idx_debts_account ON debts(account_id);
    CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
  `);
}

export async function resetDatabase(): Promise<void> {
  await expoDb.execAsync(`
    DROP TABLE IF EXISTS debt_payments;
    DROP TABLE IF EXISTS loan_payments;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS subscriptions;
    DROP TABLE IF EXISTS debts;
    DROP TABLE IF EXISTS loans;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS accounts;
  `);
  await initializeDatabase();
}
