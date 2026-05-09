import { describe, expect, test } from "vitest";
import { LinearCoreError, normalizeError } from "../src/errors/core-error.js";

class FakeAuthenticationLinearError extends Error {
  public readonly type = "AuthenticationError";
  public readonly status = 401;
  public readonly errors = [
    { message: "Invalid token", type: "AuthenticationError", userError: false },
  ];
  public readonly raw = {};

  public constructor(message: string) {
    super(message);
    this.name = "AuthenticationLinearError";
  }
}

class FakeRatelimitedLinearError extends Error {
  public readonly type = "Ratelimited";
  public readonly status = 429;
  public readonly retryAfter = 30;
  public readonly requestsResetAt = 1_700_000_000;
  public readonly errors = [{ message: "Too many requests" }];

  public constructor() {
    super("Rate limited");
    this.name = "RatelimitedLinearError";
  }
}

class FakeNetworkLinearError extends Error {
  public readonly type = "NetworkError";
  public readonly errors = [];
  public readonly raw = {};

  public constructor() {
    super("Connection lost");
    this.name = "NetworkLinearError";
  }
}

describe("normalizeError", () => {
  test("passes through LinearCoreError", () => {
    const original = new LinearCoreError("AUTH_REQUIRED", "Login required");
    expect(normalizeError(original)).toBe(original);
  });

  test("maps SDK AuthenticationLinearError to AuthenticationError code", () => {
    const result = normalizeError(new FakeAuthenticationLinearError("Invalid token"));

    expect(result.code).toBe("AuthenticationError");
    expect(result.message).toBe("Invalid token");
    expect(result.details.type).toBe("AuthenticationError");
    expect(result.details.status).toBe("401");
    expect(result.details.transient).toBe("false");
    expect(result.details.userPresentableMessage).toBe("Invalid token");
  });

  test("maps SDK RatelimitedLinearError and surfaces retryAfter", () => {
    const result = normalizeError(new FakeRatelimitedLinearError());

    expect(result.code).toBe("Ratelimited");
    expect(result.details.retryAfter).toBe("30");
    expect(result.details.requestsResetAt).toBe("1700000000");
    expect(result.details.transient).toBe("true");
  });

  test("maps SDK NetworkLinearError to NetworkError code", () => {
    const result = normalizeError(new FakeNetworkLinearError());

    expect(result.code).toBe("NetworkError");
    expect(result.details.transient).toBe("true");
  });

  test("maps AbortSignal.timeout() abort to Timeout code", () => {
    const error = new Error("The operation was aborted");
    error.name = "TimeoutError";

    const result = normalizeError(error);

    expect(result.code).toBe("Timeout");
    expect(result.details.transient).toBe("true");
  });

  test("maps AbortError to Timeout", () => {
    const error = new Error("aborted");
    error.name = "AbortError";

    expect(normalizeError(error).code).toBe("Timeout");
  });

  test("maps native fetch TypeError with cause.code ENOTFOUND to NetworkError", () => {
    const cause = Object.assign(new Error("getaddrinfo ENOTFOUND api.linear.app"), {
      code: "ENOTFOUND",
    });
    const fetchError = Object.assign(new TypeError("fetch failed"), { cause });

    const result = normalizeError(fetchError);

    expect(result.code).toBe("NetworkError");
    expect(result.details.cause).toBe("ENOTFOUND");
    expect(result.details.transient).toBe("true");
  });

  test("maps undici connect timeout cause to Timeout", () => {
    const cause = Object.assign(new Error("Connect Timeout Error"), {
      code: "UND_ERR_CONNECT_TIMEOUT",
    });
    const fetchError = Object.assign(new TypeError("fetch failed"), { cause });

    const result = normalizeError(fetchError);

    expect(result.code).toBe("Timeout");
    expect(result.details.cause).toBe("UND_ERR_CONNECT_TIMEOUT");
  });

  test("falls back to UNKNOWN for plain errors with no signal", () => {
    const result = normalizeError(new Error("boom"));
    expect(result.code).toBe("UNKNOWN");
    expect(result.message).toBe("boom");
  });

  test("maps record-shaped error to LINEAR_API_ERROR", () => {
    const result = normalizeError({ message: "graphql failed" });
    expect(result.code).toBe("LINEAR_API_ERROR");
  });

  test("returns UNKNOWN for non-error values", () => {
    expect(normalizeError(undefined).code).toBe("UNKNOWN");
    expect(normalizeError("nope").code).toBe("UNKNOWN");
  });
});
