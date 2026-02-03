import { LoanRepository } from "./loan.repository";
import { Loan, LoanPayment, LoanWithDetails } from "./loan.model";
import {
  CreateLoanInput,
  UpdateLoanInput,
  CreateLoanPaymentInput,
  LoanSummary,
} from "./loan.types";
import { LoanStatus } from "@/shared/types";
import { ValidationError } from "@/shared/errors";
import { AccountService } from "@/features/accounts";

export class LoanService {
  constructor(
    private repo = new LoanRepository(),
    private accountService = new AccountService(),
  ) {}

  async getAll(): Promise<Loan[]> {
    return this.repo.getAll();
  }

  async getAllWithDetails(): Promise<LoanWithDetails[]> {
    return this.repo.getAllWithDetails();
  }

  async getPending(): Promise<Loan[]> {
    return this.repo.getByStatus(LoanStatus.PENDING);
  }

  async getPartial(): Promise<Loan[]> {
    return this.repo.getByStatus(LoanStatus.PARTIAL);
  }

  async getPaid(): Promise<Loan[]> {
    return this.repo.getByStatus(LoanStatus.PAID);
  }

  async getById(id: string): Promise<Loan | null> {
    return this.repo.getById(id);
  }

  async create(data: CreateLoanInput): Promise<Loan> {
    this.validateLoanInput(data);

        const account = await this.accountService.getById(data.accountId);
    if (!account) {
      throw new ValidationError(`Account with id '${data.accountId}' not found`);
    }

        const loan = await this.repo.create(data);

        await this.accountService.adjustBalance(data.accountId, -data.amount);

    return loan;
  }

  async update(id: string, data: UpdateLoanInput): Promise<Loan> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async recordPayment(data: CreateLoanPaymentInput): Promise<LoanPayment> {
    const loan = await this.repo.getByIdOrThrow(data.loanId);

    if (loan.status === LoanStatus.PAID) {
      throw new ValidationError("Loan is already fully paid");
    }

    if (data.amount <= 0) {
      throw new ValidationError("Payment amount must be greater than 0");
    }

    const newPaidAmount = loan.paidAmount + data.amount;
    if (newPaidAmount > loan.amount) {
      throw new ValidationError(
        `Payment would exceed loan amount. Remaining: ${loan.amount - loan.paidAmount}`,
      );
    }

        const payment = await this.repo.createPayment(data);

        const newStatus = this.calculateStatus(newPaidAmount, loan.amount);
    await this.repo.updatePaidAmount(loan.id, newPaidAmount, newStatus);

        await this.accountService.adjustBalance(loan.accountId, data.amount);

    return payment;
  }

  async getPayments(loanId: string): Promise<LoanPayment[]> {
    return this.repo.getPayments(loanId);
  }

  async getSummary(): Promise<LoanSummary> {
    const all = await this.repo.getAll();

    const summary: LoanSummary = {
      totalLoaned: 0,
      totalPending: 0,
      totalPaid: 0,
      loanCount: all.length,
      pendingCount: 0,
      partialCount: 0,
      paidCount: 0,
    };

    for (const loan of all) {
      summary.totalLoaned += loan.amount;
      summary.totalPaid += loan.paidAmount;
      summary.totalPending += loan.amount - loan.paidAmount;

      switch (loan.status) {
        case LoanStatus.PENDING:
          summary.pendingCount++;
          break;
        case LoanStatus.PARTIAL:
          summary.partialCount++;
          break;
        case LoanStatus.PAID:
          summary.paidCount++;
          break;
      }
    }

    return summary;
  }

  private calculateStatus(paidAmount: number, totalAmount: number): LoanStatus {
    if (paidAmount >= totalAmount) {
      return LoanStatus.PAID;
    } else if (paidAmount > 0) {
      return LoanStatus.PARTIAL;
    } else {
      return LoanStatus.PENDING;
    }
  }

  private validateLoanInput(data: CreateLoanInput): void {
    if (!data.borrowerName || data.borrowerName.trim().length === 0) {
      throw new ValidationError("Borrower name is required");
    }

    if (data.amount <= 0) {
      throw new ValidationError("Loan amount must be greater than 0");
    }

    if (!data.loanDate) {
      throw new ValidationError("Loan date is required");
    }

    if (!data.accountId) {
      throw new ValidationError("Account is required");
    }
  }
}
