import { TransactionType, TransactionSource } from "@/shared/types";

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  description?: string | null;
  date: string;
  source?: TransactionSource;
  accountId: string;
  categoryId: string;
  subscriptionId?: string | null;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  description?: string | null;
  date?: string;
  accountId?: string;
  categoryId?: string;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface MonthlySummary {
  month: string;   income: number;
  expense: number;
  net: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
  transactionCount: number;
}
