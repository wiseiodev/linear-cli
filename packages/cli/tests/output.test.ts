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

  test("prints documents page items in a compact table", () => {
    const tableSpy = vi.spyOn(console, "table").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderEnvelope(
      successEnvelope("documents", "list", {
        items: [
          {
            id: "6fce2701-2293-43a1-8399-e1fec1cfe461",
            title: "Migrate Legacy -> App: Initiative Research & Steps",
            content: "# Heading\nA".repeat(400),
            url: "https://linear.app/annyai/document/migrate-legacy-app-initiative-research-and-steps-bf5d834194ea",
            projectId: null,
            initiativeId: "06ef175e-a520-491a-bd1e-0fdbf4a350c8",
            updatedAt: "2026-03-17T13:22:54.553Z",
          },
        ],
        nextCursor: "cursor-docs",
      }),
      {
        json: false,
        quiet: false,
      },
    );

    const [rows] = tableSpy.mock.calls[0] ?? [];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      key: "6fce2701",
      title: "Migrate Legacy -> App: Initiative Research & Steps",
      scope: "i:06ef175e",
      content: "4400 chars",
      updated: "2026-03-17 13:22",
    });
    expect(typeof rows[0]?.url).toBe("string");
    expect(rows[0]?.url.endsWith("\u2026")).toBe(true);
    expect(logSpy).toHaveBeenCalledWith("documents.list");
    expect(logSpy).toHaveBeenCalledWith("Next cursor: cursor-docs");
  });

  test("does not render issue detail payload with document formatting", () => {
    const tableSpy = vi.spyOn(console, "table").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderEnvelope(
      successEnvelope("issues", "get", {
        id: "i_1",
        identifier: "ANN-123",
        title: "Issue title",
        description: "Issue description",
        priority: 2,
        stateName: "Todo",
        updatedAt: "2026-03-18T00:00:00.000Z",
        url: "https://linear.app/annyai/issue/ANN-123/issue-title",
      }),
      {
        json: false,
        quiet: false,
      },
    );

    const [rows] = tableSpy.mock.calls[0] ?? [];
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      identifier: "ANN-123",
      title: "Issue title",
      description: "Issue description",
      priority: 2,
    });
    expect(rows[0]?.key).toBeUndefined();
    expect(logSpy).toHaveBeenCalledWith("issues.get");
  });

  test("applies --fields to issues JSON output and preserves nextCursor", () => {
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
            stateType: "unstarted",
            updatedAt: "2026-03-16T17:00:00.000Z",
          },
        ],
        nextCursor: "cursor-2",
      }),
      {
        json: true,
        quiet: false,
        fields: ["identifier", "stateType"],
      },
    );

    const output = logSpy.mock.calls[0]?.[0];
    expect(typeof output).toBe("string");
    const parsed = JSON.parse(String(output));
    expect(parsed.ok).toBe(true);
    expect(parsed.data.items).toEqual([{ identifier: "ENG-1", stateType: "unstarted" }]);
    expect(parsed.data.nextCursor).toBe("cursor-2");
  });

  test("redacts sensitive fields from JSON output", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderEnvelope(
      successEnvelope("auth", "login", {
        profile: "default",
        method: "oauth",
        apiKey: "lin_api_secret",
        accessToken: "access_secret",
        refreshToken: "refresh_secret",
        authorizationUrl: "https://linear.app/oauth/authorize?state=secret_state",
        redirectUri: "http://127.0.0.1:8787/oauth/callback",
        oauth: {
          clientId: "client_secretish",
          tokenUrl: "https://api.linear.app/oauth/token",
          scopes: ["read", "write"],
          nested: {
            password: "pw_secret",
          },
        },
      }),
      {
        json: true,
        quiet: false,
      },
    );

    const output = String(logSpy.mock.calls[0]?.[0]);
    expect(output).not.toContain("lin_api_secret");
    expect(output).not.toContain("access_secret");
    expect(output).not.toContain("refresh_secret");
    expect(output).not.toContain("secret_state");
    expect(output).not.toContain("client_secretish");
    expect(output).not.toContain("pw_secret");
    expect(output).toContain("[REDACTED]");
  });

  test("supports detail views with field selection for issue lists", () => {
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
            assigneeName: "Alex Example",
            projectName: "CLI v2",
            estimate: 3,
          },
        ],
        nextCursor: null,
      }),
      {
        json: false,
        quiet: false,
        view: "detail",
        fields: ["identifier", "title", "assigneeName", "projectName", "estimate"],
      },
    );

    expect(tableSpy).toHaveBeenCalledWith([
      {
        identifier: "ENG-1",
        title: "Fix output formatting",
        assigneeName: "Alex Example",
        projectName: "CLI v2",
        estimate: 3,
      },
    ]);
    expect(logSpy).toHaveBeenCalledWith("issues.list");
  });
});
