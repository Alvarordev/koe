import { AccountType } from "@/shared/types";

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency?: string;
  balance?: number;
  bankName?: string | null;
  accountNumber?: string | null;
  cci?: string | null;
  autoFillEnabled?: boolean;
  autoFillAmount?: number | null;
  autoFillDay?: number | null;
  isDefault?: boolean;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  currency?: string;
  balance?: number;
  bankName?: string | null;
  accountNumber?: string | null;
  cci?: string | null;
  autoFillEnabled?: boolean;
  autoFillAmount?: number | null;
  autoFillDay?: number | null;
  isDefault?: boolean;
}

export interface AccountSummary {
  totalBalance: number;
  accountCount: number;
  byType: Record<AccountType, number>;
}
