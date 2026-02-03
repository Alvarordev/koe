import { LoanRow, LoanPaymentRow } from "@/db/schema";
import { Loan, LoanPayment } from "./loan.model";
import { LoanType, LoanStatus } from "@/shared/types";

export const LoanMapper = {
  
  toDomain(row: LoanRow): Loan {
    return {
      id: row.id,
      borrowerName: row.borrowerName,
      amount: row.amount,
      currency: row.currency,
      type: row.type as LoanType,
      status: row.status as LoanStatus,
      interestRate: row.interestRate,
      description: row.description,
      loanDate: row.loanDate,
      dueDate: row.dueDate,
      paidAmount: row.paidAmount,
      accountId: row.accountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: LoanRow[]): Loan[] {
    return rows.map(this.toDomain);
  },
};

export const LoanPaymentMapper = {
  
  toDomain(row: LoanPaymentRow): LoanPayment {
    return {
      id: row.id,
      amount: row.amount,
      paymentDate: row.paymentDate,
      note: row.note,
      loanId: row.loanId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: LoanPaymentRow[]): LoanPayment[] {
    return rows.map(this.toDomain);
  },
};
