import { AccountType } from "@/shared/types";

export const DEFAULT_ACCOUNTS = [
  {
    name: "Efectivo",
    type: AccountType.CASH,
    currency: "PEN",
    balance: 0,
    isDefault: true,
  },
] as const;
