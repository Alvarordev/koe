import { eq, desc } from "drizzle-orm";
import { db } from "@/db/client";
import { loans, loanPayments, accounts } from "@/db/schema";
import { Loan, LoanPayment, LoanWithDetails } from "./loan.model";
import {
  CreateLoanInput,
  UpdateLoanInput,
  CreateLoanPaymentInput,
} from "./loan.types";
import { LoanMapper, LoanPaymentMapper } from "./loan.mapper";
import { generateId, now } from "@/shared/utils";
import { NotFoundError } from "@/shared/errors";
import { LoanStatus } from "@/shared/types";

export class LoanRepository {
  
  async getAll(): Promise<Loan[]> {
    const rows = await db.select().from(loans).orderBy(desc(loans.loanDate));
    return LoanMapper.toDomainList(rows);
  }

  async getAllWithDetails(): Promise<LoanWithDetails[]> {
    const rows = await db
      .select({
        id: loans.id,
        borrowerName: loans.borrowerName,
        amount: loans.amount,
        currency: loans.currency,
        type: loans.type,
        status: loans.status,
        interestRate: loans.interestRate,
        description: loans.description,
        loanDate: loans.loanDate,
        dueDate: loans.dueDate,
        paidAmount: loans.paidAmount,
        accountId: loans.accountId,
        createdAt: loans.createdAt,
        updatedAt: loans.updatedAt,
        accountName: accounts.name,
      })
      .from(loans)
      .innerJoin(accounts, eq(loans.accountId, accounts.id))
      .orderBy(desc(loans.loanDate));

    return rows.map((row) => {
      const loan = LoanMapper.toDomain(row as any);
      return {
        ...loan,
        remainingAmount: loan.amount - loan.paidAmount,
        progressPercentage:
          loan.amount > 0 ? (loan.paidAmount / loan.amount) * 100 : 0,
        accountName: row.accountName,
      };
    });
  }

  async getByStatus(status: LoanStatus): Promise<Loan[]> {
    const rows = await db
      .select()
      .from(loans)
      .where(eq(loans.status, status))
      .orderBy(desc(loans.loanDate));
    return LoanMapper.toDomainList(rows);
  }

  async getById(id: string): Promise<Loan | null> {
    const rows = await db
      .select()
      .from(loans)
      .where(eq(loans.id, id))
      .limit(1);
    return rows[0] ? LoanMapper.toDomain(rows[0]) : null;
  }

  async getByIdOrThrow(id: string): Promise<Loan> {
    const loan = await this.getById(id);
    if (!loan) {
      throw new NotFoundError("Loan", id);
    }
    return loan;
  }

  async create(data: CreateLoanInput): Promise<Loan> {
    const id = generateId();
    const timestamp = now();

    await db.insert(loans).values({
      id,
      borrowerName: data.borrowerName,
      amount: data.amount,
      currency: data.currency ?? "PEN",
      type: data.type,
      status: LoanStatus.PENDING,
      interestRate: data.interestRate ?? null,
      description: data.description ?? null,
      loanDate: data.loanDate,
      dueDate: data.dueDate ?? null,
      paidAmount: 0,
      accountId: data.accountId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.getByIdOrThrow(id);
  }

  async update(id: string, data: UpdateLoanInput): Promise<Loan> {
    await this.getByIdOrThrow(id);

    await db
      .update(loans)
      .set({
        ...data,
        updatedAt: now(),
      })
      .where(eq(loans.id, id));

    return this.getByIdOrThrow(id);
  }

  async updatePaidAmount(
    id: string,
    paidAmount: number,
    status: LoanStatus,
  ): Promise<Loan> {
    await db
      .update(loans)
      .set({
        paidAmount,
        status,
        updatedAt: now(),
      })
      .where(eq(loans.id, id));

    return this.getByIdOrThrow(id);
  }

  async delete(id: string): Promise<void> {
    await this.getByIdOrThrow(id);
    await db.delete(loans).where(eq(loans.id, id));
  }

  async getPayments(loanId: string): Promise<LoanPayment[]> {
    const rows = await db
      .select()
      .from(loanPayments)
      .where(eq(loanPayments.loanId, loanId))
      .orderBy(desc(loanPayments.paymentDate));
    return LoanPaymentMapper.toDomainList(rows);
  }

  async createPayment(data: CreateLoanPaymentInput): Promise<LoanPayment> {
    const id = generateId();
    const timestamp = now();

    await db.insert(loanPayments).values({
      id,
      amount: data.amount,
      paymentDate: data.paymentDate,
      note: data.note ?? null,
      loanId: data.loanId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const rows = await db
      .select()
      .from(loanPayments)
      .where(eq(loanPayments.id, id))
      .limit(1);
    return LoanPaymentMapper.toDomain(rows[0]);
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(loanPayments).where(eq(loanPayments.id, id));
  }
}
