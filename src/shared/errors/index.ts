export class KoeError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "KoeError";
  }
}

export class NotFoundError extends KoeError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends KoeError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class DatabaseError extends KoeError {
  constructor(message: string, public originalError?: unknown) {
    super(message, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

export class InsufficientBalanceError extends KoeError {
  constructor(accountId: string, required: number, available: number) {
    super(
      `Insufficient balance in account '${accountId}'. Required: ${required}, Available: ${available}`,
      "INSUFFICIENT_BALANCE",
    );
    this.name = "InsufficientBalanceError";
  }
}
