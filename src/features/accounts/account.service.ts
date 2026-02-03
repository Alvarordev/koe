import { AccountRepository } from "./account.repository";
import { Account } from "./account.model";
import {
  CreateAccountInput,
  UpdateAccountInput,
  AccountSummary,
} from "./account.types";
import { AccountType } from "@/shared/types";
import { ValidationError } from "@/shared/errors";

export class AccountService {
  constructor(private repo = new AccountRepository()) {}

  async getAll(): Promise<Account[]> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<Account | null> {
    return this.repo.getById(id);
  }

  async getDefault(): Promise<Account | null> {
    return this.repo.getDefault();
  }

  async create(data: CreateAccountInput): Promise<Account> {
    this.validateAccountInput(data);

    if (data.isDefault) {
      await this.repo.clearDefault();
    }

        const existingAccounts = await this.repo.getAll();
    if (existingAccounts.length === 0) {
      data.isDefault = true;
    }

    return this.repo.create(data);
  }

  async update(id: string, data: UpdateAccountInput): Promise<Account> {
    if (data.isDefault === true) {
      await this.repo.clearDefault();
    }

    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const account = await this.repo.getByIdOrThrow(id);
    const allAccounts = await this.repo.getAll();

    if (allAccounts.length === 1) {
      throw new ValidationError("Cannot delete the only account");
    }

    if (account.isDefault) {
      throw new ValidationError(
        "Cannot delete the default account. Set another account as default first.",
      );
    }

    return this.repo.delete(id);
  }

  async setDefault(id: string): Promise<Account> {
    await this.repo.clearDefault();
    return this.repo.update(id, { isDefault: true });
  }

  async adjustBalance(id: string, delta: number): Promise<Account> {
    const account = await this.repo.getByIdOrThrow(id);
    const newBalance = account.balance + delta;
    return this.repo.updateBalance(id, newBalance);
  }

  async getSummary(): Promise<AccountSummary> {
    const accounts = await this.repo.getAll();

    const summary: AccountSummary = {
      totalBalance: 0,
      accountCount: accounts.length,
      byType: {
        [AccountType.BANK]: 0,
        [AccountType.CASH]: 0,
        [AccountType.CARD]: 0,
        [AccountType.OTHER]: 0,
      },
    };

    for (const account of accounts) {
      summary.totalBalance += account.balance;
      summary.byType[account.type] += account.balance;
    }

    return summary;
  }

  private validateAccountInput(data: CreateAccountInput): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError("Account name is required");
    }

    if (data.autoFillEnabled) {
      if (data.autoFillAmount === undefined || data.autoFillAmount === null) {
        throw new ValidationError(
          "Auto-fill amount is required when auto-fill is enabled",
        );
      }
      if (data.autoFillDay === undefined || data.autoFillDay === null) {
        throw new ValidationError(
          "Auto-fill day is required when auto-fill is enabled",
        );
      }
      if (data.autoFillDay < 1 || data.autoFillDay > 31) {
        throw new ValidationError("Auto-fill day must be between 1 and 31");
      }
    }
  }
}
