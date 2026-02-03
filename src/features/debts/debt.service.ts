import { DebtRepository } from "./debt.repository";
import { Debt, DebtPayment, DebtWithDetails } from "./debt.model";
import {
  CreateDebtInput,
  UpdateDebtInput,
  CreateDebtPaymentInput,
  DebtSummary,
} from "./debt.types";
import { DebtStatus } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { AccountService } from "@/features/accounts";

export class DebtService {
  constructor(
    private repo = new DebtRepository(),
    private accountService = new AccountService(),
  ) {}

  async getAll(): Promise<Debt[]> {
    return this.repo.getAll();
  }

  async getAllWithDetails(): Promise<DebtWithDetails[]> {
    return this.repo.getAllWithDetails();
  }

  async getPending(): Promise<Debt[]> {
    return this.repo.getByStatus(DebtStatus.PENDING);
  }

  async getPartial(): Promise<Debt[]> {
    return this.repo.getByStatus(DebtStatus.PARTIAL);
  }

  async getPaid(): Promise<Debt[]> {
    return this.repo.getByStatus(DebtStatus.PAID);
  }

  async getById(id: string): Promise<Debt | null> {
    return this.repo.getById(id);
  }

  async create(data: CreateDebtInput): Promise<Debt> {
    this.validateDebtInput(data);

        const account = await this.accountService.getById(data.accountId);
    if (!account) {
      throw new ValidationError(`Account with id '${data.accountId}' not found`);
    }

        const debt = await this.repo.create(data);

        await this.accountService.adjustBalance(data.accountId, data.amount);

    return debt;
  }

  async update(id: string, data: UpdateDebtInput): Promise<Debt> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async recordPayment(data: CreateDebtPaymentInput): Promise<DebtPayment> {
    const debt = await this.repo.getByIdOrThrow(data.debtId);

    if (debt.status === DebtStatus.PAID) {
      throw new ValidationError("Debt is already fully paid");
    }

    if (data.amount <= 0) {
      throw new ValidationError("Payment amount must be greater than 0");
    }

    const newPaidAmount = debt.paidAmount + data.amount;
    if (newPaidAmount > debt.amount) {
      throw new ValidationError(
        `Payment would exceed debt amount. Remaining: ${debt.amount - debt.paidAmount}`,
      );
    }

        const payment = await this.repo.createPayment(data);

        const newStatus = this.calculateStatus(newPaidAmount, debt.amount);
    await this.repo.updatePaidAmount(debt.id, newPaidAmount, newStatus);

        await this.accountService.adjustBalance(debt.accountId, -data.amount);

    return payment;
  }

  async getPayments(debtId: string): Promise<DebtPayment[]> {
    return this.repo.getPayments(debtId);
  }

  async getSummary(): Promise<DebtSummary> {
    const all = await this.repo.getAll();

    const summary: DebtSummary = {
      totalDebt: 0,
      totalPending: 0,
      totalPaid: 0,
      debtCount: all.length,
      pendingCount: 0,
      partialCount: 0,
      paidCount: 0,
    };

    for (const debt of all) {
      summary.totalDebt += debt.amount;
      summary.totalPaid += debt.paidAmount;
      summary.totalPending += debt.amount - debt.paidAmount;

      switch (debt.status) {
        case DebtStatus.PENDING:
          summary.pendingCount++;
          break;
        case DebtStatus.PARTIAL:
          summary.partialCount++;
          break;
        case DebtStatus.PAID:
          summary.paidCount++;
          break;
      }
    }

    return summary;
  }

  private calculateStatus(paidAmount: number, totalAmount: number): DebtStatus {
    if (paidAmount >= totalAmount) {
      return DebtStatus.PAID;
    } else if (paidAmount > 0) {
      return DebtStatus.PARTIAL;
    } else {
      return DebtStatus.PENDING;
    }
  }

  private validateDebtInput(data: CreateDebtInput): void {
    if (!data.lenderName || data.lenderName.trim().length === 0) {
      throw new ValidationError("Lender name is required");
    }

    if (data.amount <= 0) {
      throw new ValidationError("Debt amount must be greater than 0");
    }

    if (!data.debtDate) {
      throw new ValidationError("Debt date is required");
    }

    if (!data.accountId) {
      throw new ValidationError("Account is required");
    }
  }
}
