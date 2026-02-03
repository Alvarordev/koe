import { LoanType, LoanStatus } from "@/shared/types";

export interface CreateLoanInput {
  borrowerName: string;
  amount: number;
  currency?: string;
  type: LoanType;
  interestRate?: number | null;
  description?: string | null;
  loanDate: string;
  dueDate?: string | null;
  accountId: string;
}

export interface UpdateLoanInput {
  borrowerName?: string;
  amount?: number;
  currency?: string;
  type?: LoanType;
  status?: LoanStatus;
  interestRate?: number | null;
  description?: string | null;
  loanDate?: string;
  dueDate?: string | null;
}

export interface CreateLoanPaymentInput {
  amount: number;
  paymentDate: string;
  note?: string | null;
  loanId: string;
}

export interface LoanSummary {
  totalLoaned: number;
  totalPending: number;
  totalPaid: number;
  loanCount: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
}
