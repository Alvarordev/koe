import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions, accounts, categories } from "@/db/schema";
import { Transaction, TransactionWithRelations } from "./transaction.model";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from "./transaction.types";
import { TransactionMapper } from "./transaction.mapper";
import { generateId, now } from "@/shared/utils";
import { NotFoundError } from "@/shared/errors";
import { TransactionType, TransactionSource } from "@/shared/types";

export class TransactionRepository {
  
  async getAll(): Promise<Transaction[]> {
    const rows = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date));
    return TransactionMapper.toDomainList(rows);
  }

  async getAllWithRelations(): Promise<TransactionWithRelations[]> {
    const rows = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        date: transactions.date,
        source: transactions.source,
        accountId: transactions.accountId,
        categoryId: transactions.categoryId,
        subscriptionId: transactions.subscriptionId,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        accountName: accounts.name,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .orderBy(desc(transactions.date));

    return rows.map((row) => ({
      ...TransactionMapper.toDomain(row as any),
      accountName: row.accountName,
      categoryName: row.categoryName,
      categoryIcon: row.categoryIcon,
      categoryColor: row.categoryColor,
    }));
  }

  async getById(id: string): Promise<Transaction | null> {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    return rows[0] ? TransactionMapper.toDomain(rows[0]) : null;
  }

  async getByIdOrThrow(id: string): Promise<Transaction> {
    const transaction = await this.getById(id);
    if (!transaction) {
      throw new NotFoundError("Transaction", id);
    }
    return transaction;
  }

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    const conditions = [];

    if (filters.accountId) {
      conditions.push(eq(transactions.accountId, filters.accountId));
    }
    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type));
    }
    if (filters.startDate) {
      conditions.push(gte(transactions.date, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(transactions.date, filters.endDate));
    }
    if (filters.minAmount !== undefined) {
      conditions.push(gte(transactions.amount, filters.minAmount));
    }
    if (filters.maxAmount !== undefined) {
      conditions.push(lte(transactions.amount, filters.maxAmount));
    }

    const query = db.select().from(transactions);
    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(transactions.date))
        : await query.orderBy(desc(transactions.date));

    return TransactionMapper.toDomainList(rows);
  }

  async getByAccountId(accountId: string): Promise<Transaction[]> {
    return this.getFiltered({ accountId });
  }

  async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Transaction[]> {
    return this.getFiltered({ startDate, endDate });
  }

  async create(data: CreateTransactionInput): Promise<Transaction> {
    const id = generateId();
    const timestamp = now();

    await db.insert(transactions).values({
      id,
      type: data.type,
      amount: data.amount,
      description: data.description ?? null,
      date: data.date,
      source: data.source ?? TransactionSource.MANUAL,
      accountId: data.accountId,
      categoryId: data.categoryId,
      subscriptionId: data.subscriptionId ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.getByIdOrThrow(id);
  }

  async update(id: string, data: UpdateTransactionInput): Promise<Transaction> {
    await this.getByIdOrThrow(id);

    await db
      .update(transactions)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(transactions.id, id));

    return this.getByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getSumByType(
    type: TransactionType,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const conditions = [eq(transactions.type, type)];

    if (startDate) conditions.push(gte(transactions.date, startDate));
    if (endDate) conditions.push(lte(transactions.date, endDate));

    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(and(...conditions));

    return result[0]?.total ?? 0;
  }
}
