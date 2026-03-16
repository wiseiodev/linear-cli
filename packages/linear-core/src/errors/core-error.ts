export type LinearCoreErrorCode =
  | "AUTH_REQUIRED"
  | "TOKEN_EXCHANGE_FAILED"
  | "TOKEN_REFRESH_FAILED"
  | "CONFIG_INVALID"
  | "CONFIG_NOT_FOUND"
  | "ENTITY_NOT_FOUND"
  | "UNSUPPORTED_OPERATION"
  | "LINEAR_API_ERROR"
  | "UNKNOWN";

export class LinearCoreError extends Error {
  public readonly code: LinearCoreErrorCode;
  public readonly details: Readonly<Record<string, string>>;

  public constructor(
    code: LinearCoreErrorCode,
    message: string,
    details?: Readonly<Record<string, string>>,
  ) {
    super(message);
    this.name = "LinearCoreError";
    this.code = code;
    this.details = details ?? {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

export function normalizeError(error: unknown): LinearCoreError {
  if (error instanceof LinearCoreError) {
    return error;
  }

  if (error instanceof Error) {
    return new LinearCoreError("UNKNOWN", error.message);
  }

  if (isRecord(error) && typeof error.message === "string") {
    return new LinearCoreError("LINEAR_API_ERROR", error.message);
  }

  return new LinearCoreError("UNKNOWN", "Unknown error");
}
