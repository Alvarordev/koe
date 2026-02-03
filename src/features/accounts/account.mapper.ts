import { AccountRow } from "@/db/schema";
import { Account } from "./account.model";
import { AccountType } from "@/shared/types";

export const AccountMapper = {
  
  toDomain(row: AccountRow): Account {
    return {
      id: row.id,
      name: row.name,
      type: row.type as AccountType,
      currency: row.currency,
      balance: row.balance,
      bankName: row.bankName,
      accountNumber: row.accountNumber,
      cci: row.cci,
      autoFillEnabled: row.autoFillEnabled,
      autoFillAmount: row.autoFillAmount,
      autoFillDay: row.autoFillDay,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  },

  toDomainList(rows: AccountRow[]): Account[] {
    return rows.map(this.toDomain);
  },
};
