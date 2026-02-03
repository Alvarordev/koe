export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingDay: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  accountId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionWithRelations extends Subscription {
  accountName: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
}
