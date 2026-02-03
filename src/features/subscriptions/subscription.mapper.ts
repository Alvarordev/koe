import { SubscriptionRow } from "@/db/schema";
import { Subscription } from "./subscription.model";

export const SubscriptionMapper = {
  
  toDomain(row: SubscriptionRow): Subscription {
    return {
      id: row.id,
      name: row.name,
      amount: row.amount,
      currency: row.currency,
      billingDay: row.billingDay,
      isActive: row.isActive,
      startDate: row.startDate,
      endDate: row.endDate,
      accountId: row.accountId,
      categoryId: row.categoryId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: SubscriptionRow[]): Subscription[] {
    return rows.map(this.toDomain);
  },
};
