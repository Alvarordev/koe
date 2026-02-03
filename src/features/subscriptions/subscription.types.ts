export interface CreateSubscriptionInput {
  name: string;
  amount: number;
  currency?: string;
  billingDay: number;
  isActive?: boolean;
  startDate: string;
  endDate?: string | null;
  accountId: string;
  categoryId: string;
}

export interface UpdateSubscriptionInput {
  name?: string;
  amount?: number;
  currency?: string;
  billingDay?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string | null;
  accountId?: string;
  categoryId?: string;
}

export interface SubscriptionSummary {
  totalMonthly: number;
  activeCount: number;
  inactiveCount: number;
}
