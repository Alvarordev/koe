import { TransactionRepository } from "./transaction.repository";
import { Transaction, TransactionWithRelations } from "./transaction.model";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  TransactionSummary,
  CategorySummary,
} from "./transaction.types";
import { TransactionType } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { AccountService } from "@/features/accounts";
import { CategoryService } from "@/features/categories";
import { getMonthStart, getMonthEnd } from "@/shared/utils";

export class TransactionService {
  constructor(
    private repo = new TransactionRepository(),
    private accountService = new AccountService(),
    private categoryService = new CategoryService(),
  ) {}

  async getAll(): Promise<Transaction[]> {
    return this.repo.getAll();
  }

  async getAllWithRelations(): Promise<TransactionWithRelations[]> {
    return this.repo.getAllWithRelations();
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.repo.getById(id);
  }

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    return this.repo.getFiltered(filters);
  }

  async getThisMonth(): Promise<Transaction[]> {
    const start = getMonthStart();
    const end = getMonthEnd();
    return this.repo.getByDateRange(start.toISOString(), end.toISOString());
  }

  async create(data: CreateTransactionInput): Promise<Transaction> {
    this.validateTransactionInput(data);

        const account = await this.accountService.getById(data.accountId);
    if (!account) {
      throw new ValidationError(`Account with id '${data.accountId}' not found`);
    }

        await this.categoryService.validateExists(data.categoryId);

        const transaction = await this.repo.create(data);

        const balanceChange =
      data.type === TransactionType.INCOME ? data.amount : -data.amount;
    await this.accountService.adjustBalance(data.accountId, balanceChange);

    return transaction;
  }

  async update(id: string, data: UpdateTransactionInput): Promise<Transaction> {
    const existing = await this.repo.getByIdOrThrow(id);

        const oldBalanceChange =
      existing.type === TransactionType.INCOME
        ? -existing.amount
        : existing.amount;
    await this.accountService.adjustBalance(existing.accountId, oldBalanceChange);

        const newType = data.type ?? existing.type;
    const newAmount = data.amount ?? existing.amount;
    const newAccountId = data.accountId ?? existing.accountId;

    const newBalanceChange =
      newType === TransactionType.INCOME ? newAmount : -newAmount;
    await this.accountService.adjustBalance(newAccountId, newBalanceChange);

    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const transaction = await this.repo.getByIdOrThrow(id);

        const balanceChange =
      transaction.type === TransactionType.INCOME
        ? -transaction.amount
        : transaction.amount;
    await this.accountService.adjustBalance(
      transaction.accountId,
      balanceChange,
    );

    return this.repo.delete(id);
  }

  async getSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
    const [totalIncome, totalExpense] = await Promise.all([
      this.repo.getSumByType(TransactionType.INCOME, startDate, endDate),
      this.repo.getSumByType(TransactionType.EXPENSE, startDate, endDate),
    ]);

    const transactions = await this.repo.getFiltered({ startDate, endDate });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }

  async getMonthSummary(): Promise<TransactionSummary> {
    const start = getMonthStart().toISOString();
    const end = getMonthEnd().toISOString();
    return this.getSummary(start, end);
  }

  async getExpensesByCategory(
    startDate?: string,
    endDate?: string,
  ): Promise<CategorySummary[]> {
    const transactions = await this.repo.getFiltered({
      type: TransactionType.EXPENSE,
      startDate,
      endDate,
    });

    const allCategories = await this.categoryService.getExpenseCategories();
    const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, { total: number; count: number }>();

    for (const transaction of transactions) {
      const existing = categoryMap.get(transaction.categoryId) ?? {
        total: 0,
        count: 0,
      };
      categoryMap.set(transaction.categoryId, {
        total: existing.total + transaction.amount,
        count: existing.count + 1,
      });
    }

    return allCategories
      .filter((cat) => categoryMap.has(cat.id))
      .map((category) => {
        const data = categoryMap.get(category.id)!;
        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryIcon: category.icon,
          categoryColor: category.color,
          total: data.total,
          percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
          transactionCount: data.count,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  private validateTransactionInput(data: CreateTransactionInput): void {
    if (data.amount <= 0) {
      throw new ValidationError("Transaction amount must be greater than 0");
    }

    if (!data.date) {
      throw new ValidationError("Transaction date is required");
    }

    if (!data.accountId) {
      throw new ValidationError("Account is required");
    }

    if (!data.categoryId) {
      throw new ValidationError("Category is required");
    }
  }
}
