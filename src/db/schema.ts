import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),   currency: text("currency").notNull().default("PEN"),
  balance: real("balance").notNull().default(0),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  cci: text("cci"),
  autoFillEnabled: integer("auto_fill_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  autoFillAmount: real("auto_fill_amount"),
  autoFillDay: integer("auto_fill_day"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull(),   isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),   amount: real("amount").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  source: text("source").notNull().default("MANUAL"),   accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  subscriptionId: text("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("PEN"),
  billingDay: integer("billing_day").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const loans = sqliteTable("loans", {
  id: text("id").primaryKey(),
  borrowerName: text("borrower_name").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("PEN"),
  type: text("type").notNull(),   status: text("status").notNull().default("PENDING"),   interestRate: real("interest_rate"),
  description: text("description"),
  loanDate: text("loan_date").notNull(),
  dueDate: text("due_date"),
  paidAmount: real("paid_amount").notNull().default(0),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const loanPayments = sqliteTable("loan_payments", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  note: text("note"),
  loanId: text("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const debts = sqliteTable("debts", {
  id: text("id").primaryKey(),
  lenderName: text("lender_name").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("PEN"),
  type: text("type").notNull(),   status: text("status").notNull().default("PENDING"),   interestRate: real("interest_rate"),
  description: text("description"),
  debtDate: text("debt_date").notNull(),
  dueDate: text("due_date"),
  paidAmount: real("paid_amount").notNull().default(0),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const debtPayments = sqliteTable("debt_payments", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  note: text("note"),
  debtId: text("debt_id")
    .notNull()
    .references(() => debts.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type AccountRow = typeof accounts.$inferSelect;
export type NewAccountRow = typeof accounts.$inferInsert;

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;

export type TransactionRow = typeof transactions.$inferSelect;
export type NewTransactionRow = typeof transactions.$inferInsert;

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type NewSubscriptionRow = typeof subscriptions.$inferInsert;

export type LoanRow = typeof loans.$inferSelect;
export type NewLoanRow = typeof loans.$inferInsert;

export type LoanPaymentRow = typeof loanPayments.$inferSelect;
export type NewLoanPaymentRow = typeof loanPayments.$inferInsert;

export type DebtRow = typeof debts.$inferSelect;
export type NewDebtRow = typeof debts.$inferInsert;

export type DebtPaymentRow = typeof debtPayments.$inferSelect;
export type NewDebtPaymentRow = typeof debtPayments.$inferInsert;
