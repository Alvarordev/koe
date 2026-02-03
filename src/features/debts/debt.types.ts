import { DebtType, DebtStatus } from "@/shared/types";

export interface CreateDebtInput {
  lenderName: string;
  amount: number;
  currency?: string;
  type: DebtType;
  interestRate?: number | null;
  description?: string | null;
  debtDate: string;
  dueDate?: string | null;
  accountId: string;
}

export interface UpdateDebtInput {
  lenderName?: string;
  amount?: number;
  currency?: string;
  type?: DebtType;
  status?: DebtStatus;
  interestRate?: number | null;
  description?: string | null;
  debtDate?: string;
  dueDate?: string | null;
}

export interface CreateDebtPaymentInput {
  amount: number;
  paymentDate: string;
  note?: string | null;
  debtId: string;
}

export interface DebtSummary {
  totalDebt: number;
  totalPending: number;
  totalPaid: number;
  debtCount: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
}
