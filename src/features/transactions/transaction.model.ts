import { TransactionType, TransactionSource } from "@/shared/types";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  source: TransactionSource;
  accountId: string;
  categoryId: string;
  subscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionWithRelations extends Transaction {
  accountName: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}
