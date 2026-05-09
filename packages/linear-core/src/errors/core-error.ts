export type LinearCoreErrorCode =
  | "AUTH_REQUIRED"
  | "TOKEN_EXCHANGE_FAILED"
  | "TOKEN_REFRESH_FAILED"
  | "CONFIG_INVALID"
  | "CONFIG_NOT_FOUND"
  | "ENTITY_NOT_FOUND"
  | "UNSUPPORTED_OPERATION"
  | "LINEAR_API_ERROR"
  | "NetworkError"
  | "Timeout"
  | "Ratelimited"
  | "AuthenticationError"
  | "Forbidden"
  | "InvalidInput"
  | "InternalError"
  | "LockTimeout"
  | "UsageLimitExceeded"
  | "FeatureNotAccessible"
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

const SDK_TYPE_TO_CODE: Record<string, LinearCoreErrorCode> = {
  NetworkError: "NetworkError",
  Ratelimited: "Ratelimited",
  AuthenticationError: "AuthenticationError",
  Forbidden: "Forbidden",
  InvalidInput: "InvalidInput",
  InternalError: "InternalError",
  LockTimeout: "LockTimeout",
  UsageLimitExceeded: "UsageLimitExceeded",
  FeatureNotAccessible: "FeatureNotAccessible",
};

const TRANSIENT_CODES: ReadonlySet<LinearCoreErrorCode> = new Set([
  "NetworkError",
  "Timeout",
  "Ratelimited",
  "InternalError",
  "LockTimeout",
]);

const TIMEOUT_CAUSE_CODES: ReadonlySet<string> = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "ETIMEDOUT",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function setDetail(details: Record<string, string>, key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value === "string") {
    if (value.length > 0) {
      details[key] = value;
    }
    return;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    details[key] = String(value);
    return;
  }
}

function transientFlag(code: LinearCoreErrorCode): "true" | "false" {
  return TRANSIENT_CODES.has(code) ? "true" : "false";
}

function isLinearSdkError(value: unknown): value is {
  readonly name: string;
  readonly message: string;
  readonly type?: string;
  readonly status?: number;
  readonly errors?: ReadonlyArray<{
    readonly type?: string;
    readonly message?: string;
    readonly userError?: boolean;
    readonly path?: readonly string[];
  }>;
  readonly raw?: unknown;
  readonly retryAfter?: number;
  readonly requestsResetAt?: number;
} {
  if (!(value instanceof Error)) {
    return false;
  }
  if (typeof value.name !== "string" || !value.name.endsWith("LinearError")) {
    return false;
  }
  return "type" in value || "errors" in value || "raw" in value;
}

function firstUserPresentableMessage(errors: unknown): string | undefined {
  if (!Array.isArray(errors)) {
    return undefined;
  }
  for (const entry of errors) {
    if (isRecord(entry) && typeof entry.message === "string" && entry.message.length > 0) {
      return entry.message;
    }
  }
  return undefined;
}

function normalizeSdkError(error: ReturnType<typeof asAny>): LinearCoreError {
  const details: Record<string, string> = {};
  const sdkType = typeof error.type === "string" ? error.type : undefined;
  setDetail(details, "type", sdkType);
  setDetail(details, "status", error.status);

  let code: LinearCoreErrorCode = "LINEAR_API_ERROR";
  if (sdkType && SDK_TYPE_TO_CODE[sdkType]) {
    code = SDK_TYPE_TO_CODE[sdkType] as LinearCoreErrorCode;
  } else if (typeof error.status === "number" && error.status >= 500) {
    code = "InternalError";
  } else if (sdkType === "Unknown" || sdkType === "Other" || sdkType === "GraphqlError") {
    code = "LINEAR_API_ERROR";
  }

  if (code === "Ratelimited") {
    setDetail(details, "retryAfter", error.retryAfter);
    setDetail(details, "requestsResetAt", error.requestsResetAt);
  }

  const friendly = firstUserPresentableMessage(error.errors);
  setDetail(details, "userPresentableMessage", friendly);

  details.transient = transientFlag(code);

  return new LinearCoreError(code, error.message || friendly || "Linear API error", details);
}

function asAny(value: unknown): {
  readonly name: string;
  readonly message: string;
  readonly type?: string;
  readonly status?: number;
  readonly errors?: ReadonlyArray<{ readonly message?: string }>;
  readonly retryAfter?: number;
  readonly requestsResetAt?: number;
} {
  return value as {
    readonly name: string;
    readonly message: string;
    readonly type?: string;
    readonly status?: number;
    readonly errors?: ReadonlyArray<{ readonly message?: string }>;
    readonly retryAfter?: number;
    readonly requestsResetAt?: number;
  };
}

function readCauseCode(error: Error): string | undefined {
  const cause = (error as { cause?: unknown }).cause;
  if (!isRecord(cause)) {
    return undefined;
  }
  if (typeof cause.code === "string") {
    return cause.code;
  }
  return undefined;
}

function readErrorCode(error: Error): string | undefined {
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function isAbortLike(error: Error): boolean {
  if (error.name === "AbortError" || error.name === "TimeoutError") {
    return true;
  }
  const code = readErrorCode(error);
  if (code === "ABORT_ERR" || code === "ETIMEDOUT") {
    return true;
  }
  const causeCode = readCauseCode(error);
  if (causeCode && TIMEOUT_CAUSE_CODES.has(causeCode)) {
    return true;
  }
  return false;
}

export function normalizeError(error: unknown): LinearCoreError {
  if (error instanceof LinearCoreError) {
    return error;
  }

  if (isLinearSdkError(error)) {
    return normalizeSdkError(asAny(error));
  }

  if (error instanceof Error) {
    if (isAbortLike(error)) {
      const details: Record<string, string> = { transient: "true" };
      const causeCode = readCauseCode(error) ?? readErrorCode(error);
      setDetail(details, "cause", causeCode);
      return new LinearCoreError("Timeout", error.message || "Request timed out", details);
    }

    const causeCode = readCauseCode(error);
    if (causeCode) {
      const details: Record<string, string> = { cause: causeCode };
      const code: LinearCoreErrorCode = TIMEOUT_CAUSE_CODES.has(causeCode)
        ? "Timeout"
        : "NetworkError";
      details.transient = transientFlag(code);
      return new LinearCoreError(code, `${error.message} (${causeCode})`, details);
    }

    if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
      return new LinearCoreError("NetworkError", error.message, {
        transient: transientFlag("NetworkError"),
      });
    }

    return new LinearCoreError("UNKNOWN", error.message);
  }

  if (isRecord(error) && typeof error.message === "string") {
    return new LinearCoreError("LINEAR_API_ERROR", error.message);
  }

  return new LinearCoreError("UNKNOWN", "Unknown error");
}
