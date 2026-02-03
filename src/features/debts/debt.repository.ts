import { eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { debts, debtPayments, accounts } from "@/db/schema";
import { Debt, DebtPayment, DebtWithDetails } from "./debt.model";
import {
  CreateDebtInput,
  UpdateDebtInput,
  CreateDebtPaymentInput,
} from "./debt.types";
import { DebtMapper, DebtPaymentMapper } from "./debt.mapper";
import { generateId, now } from "@/shared/utils";
import { NotFoundError } from "@/shared/errors";
import { DebtStatus } from "@/shared/types";

export class DebtRepository {
  
  async getAll(): Promise<Debt[]> {
    const rows = await db.select().from(debts).orderBy(desc(debts.debtDate));
    return DebtMapper.toDomainList(rows);
  }

  async getAllWithDetails(): Promise<DebtWithDetails[]> {
    const rows = await db
      .select({
        id: debts.id,
        lenderName: debts.lenderName,
        amount: debts.amount,
        currency: debts.currency,
        type: debts.type,
        status: debts.status,
        interestRate: debts.interestRate,
        description: debts.description,
        debtDate: debts.debtDate,
        dueDate: debts.dueDate,
        paidAmount: debts.paidAmount,
        accountId: debts.accountId,
        createdAt: debts.createdAt,
        updatedAt: debts.updatedAt,
        accountName: accounts.name,
      })
      .from(debts)
      .innerJoin(accounts, eq(debts.accountId, accounts.id))
      .orderBy(desc(debts.debtDate));

    return rows.map((row) => {
      const debt = DebtMapper.toDomain(row as any);
      return {
        ...debt,
        remainingAmount: debt.amount - debt.paidAmount,
        progressPercentage:
          debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0,
        accountName: row.accountName,
      };
    });
  }

  async getByStatus(status: DebtStatus): Promise<Debt[]> {
    const rows = await db
      .select()
      .from(debts)
      .where(eq(debts.status, status))
      .orderBy(desc(debts.debtDate));
    return DebtMapper.toDomainList(rows);
  }

  async getById(id: string): Promise<Debt | null> {
    const rows = await db
      .select()
      .from(debts)
      .where(eq(debts.id, id))
      .limit(1);
    return rows[0] ? DebtMapper.toDomain(rows[0]) : null;
  }

  async getByIdOrThrow(id: string): Promise<Debt> {
    const debt = await this.getById(id);
    if (!debt) {
      throw new NotFoundError("Debt", id);
    }
    return debt;
  }

  async create(data: CreateDebtInput): Promise<Debt> {
    const id = generateId();
    const timestamp = now();

    await db.insert(debts).values({
      id,
      lenderName: data.lenderName,
      amount: data.amount,
      currency: data.currency ?? "PEN",
      type: data.type,
      status: DebtStatus.PENDING,
      interestRate: data.interestRate ?? null,
      description: data.description ?? null,
      debtDate: data.debtDate,
      dueDate: data.dueDate ?? null,
      paidAmount: 0,
      accountId: data.accountId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.getByIdOrThrow(id);
  }

  async update(id: string, data: UpdateDebtInput): Promise<Debt> {
    await this.getByIdOrThrow(id);

    await db
      .update(debts)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(debts.id, id));

    return this.getByIdOrThrow(id);
  }

  async updatePaidAmount(
    id: string,
    paidAmount: number,
    status: DebtStatus,
  ): Promise<Debt> {
    await db
      .update(debts)
      .set({
        paidAmount,
        status,
        updatedAt: now(),
      })
      .where(eq(debts.id, id));

    return this.getByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    await db.delete(debts).where(eq(debts.id, id));
  }

  async getPayments(debtId: string): Promise<DebtPayment[]> {
    const rows = await db
      .select()
      .from(debtPayments)
      .where(eq(debtPayments.debtId, debtId))
      .orderBy(desc(debtPayments.paymentDate));
    return DebtPaymentMapper.toDomainList(rows);
  }

  async createPayment(data: CreateDebtPaymentInput): Promise<DebtPayment> {
    const id = generateId();
    const timestamp = now();

    await db.insert(debtPayments).values({
      id,
      amount: data.amount,
      paymentDate: data.paymentDate,
      note: data.note ?? null,
      debtId: data.debtId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const rows = await db
      .select()
      .from(debtPayments)
      .where(eq(debtPayments.id, id))
      .limit(1);
    return DebtPaymentMapper.toDomain(rows[0]);
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(debtPayments).where(eq(debtPayments.id, id));
  }
}
