import { successEnvelope } from "@wiseiodev/linear-core";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderEnvelope } from "../src/formatters/output.js";

describe("renderEnvelope", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("prints page items as a table and shows the next cursor separately", () => {
    const tableSpy = vi.spyOn(console, "table").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderEnvelope(
      successEnvelope("issues", "list", {
        items: [
          {
            id: "issue-1",
            identifier: "ENG-1",
            title: "Fix output formatting",
            priority: 2,
            stateName: "Todo",
            updatedAt: "2026-03-16T17:00:00.000Z",
          },
        ],
        nextCursor: "cursor-2",
      }),
      {
        json: false,
        quiet: false,
      },
    );

    expect(tableSpy).toHaveBeenCalledWith([
      {
        key: "ENG-1",
        title: "Fix output formatting",
        state: "Todo",
        priority: 2,
        updated: "2026-03-16 17:00",
      },
    ]);
    expect(logSpy).toHaveBeenCalledWith("issues.list");
    expect(logSpy).toHaveBeenCalledWith("Next cursor: cursor-2");
  });
});
