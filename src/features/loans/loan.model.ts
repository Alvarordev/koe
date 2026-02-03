import { LoanType, LoanStatus } from "@/shared/types";

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  currency: string;
  type: LoanType;
  status: LoanStatus;
  interestRate: number | null;
  description: string | null;
  loanDate: string;
  dueDate: string | null;
  paidAmount: number;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  id: string;
  amount: number;
  paymentDate: string;
  note: string | null;
  loanId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanWithDetails extends Loan {
  remainingAmount: number;
  progressPercentage: number;
  accountName: string;
}
