import { TransactionRow } from "@/db/schema";
import { Transaction } from "./transaction.model";
import { TransactionType, TransactionSource } from "@/shared/types";

export const TransactionMapper = {
  
  toDomain(row: TransactionRow): Transaction {
    return {
      id: row.id,
      type: row.type as TransactionType,
      amount: row.amount,
      description: row.description,
      date: row.date,
      source: row.source as TransactionSource,
      accountId: row.accountId,
      categoryId: row.categoryId,
      subscriptionId: row.subscriptionId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: TransactionRow[]): Transaction[] {
    return rows.map(this.toDomain);
  },
};
