import { describe, expect, test } from "vitest";
import { errorEnvelope, isErrorEnvelope, successEnvelope } from "../src/output/envelope.js";

describe("output envelope", () => {
  test("creates success envelope", () => {
    const envelope = successEnvelope("issues", "list", [{ id: "1" }], {
      count: 1,
      nextCursor: null,
    });

    expect(envelope.ok).toBe(true);
    expect(envelope.data).toHaveLength(1);
  });

  test("creates error envelope and detects type", () => {
    const envelope = errorEnvelope("issues", "get", {
      code: "ENTITY_NOT_FOUND",
      message: "Missing",
    });

    expect(isErrorEnvelope(envelope)).toBe(true);
    expect(envelope.error.code).toBe("ENTITY_NOT_FOUND");
  });
});
