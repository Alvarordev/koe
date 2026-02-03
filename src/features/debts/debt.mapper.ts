import { DebtRow, DebtPaymentRow } from "@/db/schema";
import { Debt, DebtPayment } from "./debt.model";
import { DebtType, DebtStatus } from "@/shared/types";

export const DebtMapper = {
  
  toDomain(row: DebtRow): Debt {
    return {
      id: row.id,
      lenderName: row.lenderName,
      amount: row.amount,
      currency: row.currency,
      type: row.type as DebtType,
      status: row.status as DebtStatus,
      interestRate: row.interestRate,
      description: row.description,
      debtDate: row.debtDate,
      dueDate: row.dueDate,
      paidAmount: row.paidAmount,
      accountId: row.accountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: DebtRow[]): Debt[] {
    return rows.map(this.toDomain);
  },
};

export const DebtPaymentMapper = {
  
  toDomain(row: DebtPaymentRow): DebtPayment {
    return {
      id: row.id,
      amount: row.amount,
      paymentDate: row.paymentDate,
      note: row.note,
      debtId: row.debtId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: DebtPaymentRow[]): DebtPayment[] {
    return rows.map(this.toDomain);
  },
};
