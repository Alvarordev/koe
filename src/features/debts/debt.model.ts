import { DebtType, DebtStatus } from "@/shared/types";

export interface Debt {
  id: string;
  lenderName: string;
  amount: number;
  currency: string;
  type: DebtType;
  status: DebtStatus;
  interestRate: number | null;
  description: string | null;
  debtDate: string;
  dueDate: string | null;
  paidAmount: number;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  paymentDate: string;
  note: string | null;
  debtId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtWithDetails extends Debt {
  remainingAmount: number;
  progressPercentage: number;
  accountName: string;
}
