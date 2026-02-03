import { SubscriptionRepository } from "./subscription.repository";
import { Subscription, SubscriptionWithRelations } from "./subscription.model";
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionSummary,
} from "./subscription.types";
import { ValidationError } from "@/shared/errors";
import { AccountService } from "@/features/accounts";
import { CategoryService } from "@/features/categories";
import { TransactionService } from "@/features/transactions";
import { TransactionType, TransactionSource } from "@/shared/types";

export class SubscriptionService {
  constructor(
    private repo = new SubscriptionRepository(),
    private accountService = new AccountService(),
    private categoryService = new CategoryService(),
    private transactionService = new TransactionService(),
  ) {}

  async getAll(): Promise<Subscription[]> {
    return this.repo.getAll();
  }

  async getAllWithRelations(): Promise<SubscriptionWithRelations[]> {
    return this.repo.getAllWithRelations();
  }

  async getActive(): Promise<Subscription[]> {
    return this.repo.getActive();
  }

  async getById(id: string): Promise<Subscription | null> {
    return this.repo.getById(id);
  }

  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    this.validateSubscriptionInput(data);

        const account = await this.accountService.getById(data.accountId);
    if (!account) {
      throw new ValidationError(`Account with id '${data.accountId}' not found`);
    }

        await this.categoryService.validateExists(data.categoryId);

    return this.repo.create(data);
  }

  async update(
    id: string,
    data: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    if (data.billingDay !== undefined) {
      if (data.billingDay < 1 || data.billingDay > 31) {
        throw new ValidationError("Billing day must be between 1 and 31");
      }
    }

    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async activate(id: string): Promise<Subscription> {
    return this.repo.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<Subscription> {
    return this.repo.update(id, { isActive: false });
  }

  async processPayment(subscriptionId: string): Promise<void> {
    const subscription = await this.repo.getByIdOrThrow(subscriptionId);

    if (!subscription.isActive) {
      throw new ValidationError("Cannot process payment for inactive subscription");
    }

    await this.transactionService.create({
      type: TransactionType.EXPENSE,
      amount: subscription.amount,
      description: `${subscription.name} - Subscription`,
      date: new Date().toISOString(),
      source: TransactionSource.SUBSCRIPTION,
      accountId: subscription.accountId,
      categoryId: subscription.categoryId,
      subscriptionId: subscription.id,
    });
  }

  async getSummary(): Promise<SubscriptionSummary> {
    const all = await this.repo.getAll();
    const active = all.filter((s) => s.isActive);
    const inactive = all.filter((s) => !s.isActive);

    return {
      totalMonthly: active.reduce((sum, s) => sum + s.amount, 0),
      activeCount: active.length,
      inactiveCount: inactive.length,
    };
  }

  async getDueOn(day: number): Promise<Subscription[]> {
    const active = await this.repo.getActive();
    return active.filter((s) => s.billingDay === day);
  }

  async getDueToday(): Promise<Subscription[]> {
    const today = new Date().getDate();
    return this.getDueOn(today);
  }

  private validateSubscriptionInput(data: CreateSubscriptionInput): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Subscription name is required");
    }

    if (data.amount <= 0) {
      throw new ValidationError("Subscription amount must be greater than 0");
    }

    if (data.billingDay < 1 || data.billingDay > 31) {
      throw new ValidationError("Billing day must be between 1 and 31");
    }

    if (!data.accountId) {
      throw new ValidationError("Account is required");
    }

    if (!data.categoryId) {
      throw new ValidationError("Category is required");
    }
  }
}
