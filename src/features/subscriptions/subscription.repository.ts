import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { subscriptions, accounts, categories } from "@/db/schema";
import { Subscription, SubscriptionWithRelations } from "./subscription.model";
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "./subscription.types";
import { SubscriptionMapper } from "./subscription.mapper";
import { generateId, now } from "@/shared/utils";
import { NotFoundError } from "@/shared/errors";

export class SubscriptionRepository {
  
  async getAll(): Promise<Subscription[]> {
    const rows = await db
      .select()
      .from(subscriptions)
      .orderBy(subscriptions.name);
    return SubscriptionMapper.toDomainList(rows);
  }

  async getAllWithRelations(): Promise<SubscriptionWithRelations[]> {
    const rows = await db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        amount: subscriptions.amount,
        currency: subscriptions.currency,
        billingDay: subscriptions.billingDay,
        isActive: subscriptions.isActive,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        accountId: subscriptions.accountId,
        categoryId: subscriptions.categoryId,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        accountName: accounts.name,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
      })
      .from(subscriptions)
      .innerJoin(accounts, eq(subscriptions.accountId, accounts.id))
      .innerJoin(categories, eq(subscriptions.categoryId, categories.id))
      .orderBy(subscriptions.name);

    return rows.map((row) => ({
      ...SubscriptionMapper.toDomain(row as any),
      accountName: row.accountName,
      categoryName: row.categoryName,
      categoryIcon: row.categoryIcon,
      categoryColor: row.categoryColor,
    }));
  }

  async getActive(): Promise<Subscription[]> {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isActive, true))
      .orderBy(subscriptions.billingDay);
    return SubscriptionMapper.toDomainList(rows);
  }

  async getById(id: string): Promise<Subscription | null> {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);
    return rows[0] ? SubscriptionMapper.toDomain(rows[0]) : null;
  }

  async getByIdOrThrow(id: string): Promise<Subscription> {
    const subscription = await this.getById(id);
    if (!subscription) {
      throw new NotFoundError("Subscription", id);
    }
    return subscription;
  }

  async create(data: CreateSubscriptionInput): Promise<Subscription> {
    const id = generateId();
    const timestamp = now();

    await db.insert(subscriptions).values({
      id,
      name: data.name,
      amount: data.amount,
      currency: data.currency ?? "PEN",
      billingDay: data.billingDay,
      isActive: data.isActive ?? true,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      accountId: data.accountId,
      categoryId: data.categoryId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.getByIdOrThrow(id);
  }

  async update(
    id: string,
    data: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    await this.getByIdOrThrow(id);

    await db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(subscriptions.id, id));

    return this.getByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }
}
