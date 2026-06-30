import type { ErrorCode } from "@zkhelios/shared-types";

/** Base application error mapped to a consistent JSON response by the handler. */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(400, "VALIDATION_FAILED", message);
  }
}
export class AuthError extends AppError {
  constructor(code: ErrorCode = "AUTH_UNAUTHORIZED", message = "Unauthorized") {
    super(401, code, message);
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "AUTH_FORBIDDEN", message);
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
  }
}
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(409, "CONFLICT", message);
  }
}
export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(429, "RATE_LIMITED", message);
  }
}
