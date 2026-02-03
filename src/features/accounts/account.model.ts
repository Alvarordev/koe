import { AccountType } from "@/shared/types";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  bankName: string | null;
  accountNumber: string | null;
  cci: string | null;
  autoFillEnabled: boolean;
  autoFillAmount: number | null;
  autoFillDay: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
