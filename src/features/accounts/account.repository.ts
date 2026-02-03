import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { accounts } from "@/db/schema";
import { Account } from "./account.model";
import { CreateAccountInput, UpdateAccountInput } from "./account.types";
import { AccountMapper } from "./account.mapper";
import { generateId, now } from "@/shared/utils";
import { NotFoundError } from "@/shared/errors";

export class AccountRepository {
  
  async getAll(): Promise<Account[]> {
    const rows = await db.select().from(accounts).orderBy(accounts.createdAt);
    return AccountMapper.toDomainList(rows);
  }

  async getById(id: string): Promise<Account | null> {
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);
    return rows[0] ? AccountMapper.toDomain(rows[0]) : null;
  }

  async getByIdOrThrow(id: string): Promise<Account> {
    const account = await this.getById(id);
    if (!account) {
      throw new NotFoundError("Account", id);
    }
    return account;
  }

  async getDefault(): Promise<Account | null> {
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.isDefault, true))
      .limit(1);
    return rows[0] ? AccountMapper.toDomain(rows[0]) : null;
  }

  async create(data: CreateAccountInput): Promise<Account> {
    const id = generateId();
    const timestamp = now();

    await db.insert(accounts).values({
      id,
      name: data.name,
      type: data.type,
      currency: data.currency ?? "PEN",
      balance: data.balance ?? 0,
      bankName: data.bankName ?? null,
      accountNumber: data.accountNumber ?? null,
      cci: data.cci ?? null,
      autoFillEnabled: data.autoFillEnabled ?? false,
      autoFillAmount: data.autoFillAmount ?? null,
      autoFillDay: data.autoFillDay ?? null,
      isDefault: data.isDefault ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.getByIdOrThrow(id);
  }

  async update(id: string, data: UpdateAccountInput): Promise<Account> {
    await this.getByIdOrThrow(id);

    await db
      .update(accounts)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(accounts.id, id));

    return this.getByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    return this.update(id, { balance: newBalance });
  }

  async clearDefault(): Promise<void> {
    await db
      .update(accounts)
      .set({ isDefault: false, updatedAt: now() })
      .where(eq(accounts.isDefault, true));
  }
}
