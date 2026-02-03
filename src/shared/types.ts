export enum AccountType {
  BANK = "BANK",
  CASH = "CASH",
  CARD = "CARD",
  OTHER = "OTHER",
}

export enum CategoryType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
  BOTH = "BOTH",
}

export enum TransactionType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
}

export enum TransactionSource {
  MANUAL = "MANUAL",
  VOICE = "VOICE",
  SUBSCRIPTION = "SUBSCRIPTION",
  AUTO_FILL = "AUTO_FILL",
}

export enum LoanType {
  CASUAL = "CASUAL",
  BANK = "BANK",
}

export enum LoanStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
}

export enum DebtType {
  CASUAL = "CASUAL",
  BANK = "BANK",
}

export enum DebtStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
}

export enum RecurrenceInterval {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}
