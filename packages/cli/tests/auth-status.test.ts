import type { ActiveSession, AuthStatus } from "@wiseiodev/linear-core";
import { describe, expect, test } from "vitest";
import { type AuthStatusReportManager, buildAuthStatusReport } from "../src/auth/status-report.js";

const baseAuthenticatedStatus: AuthStatus = {
  profile: "default",
  method: "oauth",
  hasApiKey: false,
  hasAccessToken: true,
  oauthConfigured: true,
  hasRefreshToken: true,
  expiresAt: "2099-01-01T00:00:00.000Z",
  expired: false,
  scopes: ["read", "write"],
  redirectUri: "http://127.0.0.1:8787/oauth/callback",
};

const unauthenticatedStatus: AuthStatus = {
  profile: "default",
  hasApiKey: false,
  hasAccessToken: false,
  oauthConfigured: false,
  hasRefreshToken: false,
  expired: false,
};

interface SessionStub {
  readonly viewer?: { id: string; name: string; displayName?: string; email: string } | Error;
  readonly organization?: { id: string; name: string; urlKey: string } | Error;
  readonly listTeams?:
    | ReadonlyArray<{ id: string; key: string; name: string }>
    | ReadonlyArray<{
        readonly items: ReadonlyArray<{ id: string; key: string; name: string }>;
        readonly nextCursor: string | null;
      }>;
}

function makeSession(stub: SessionStub): ActiveSession {
  const viewer =
    stub.viewer instanceof Error ? Promise.reject(stub.viewer) : Promise.resolve(stub.viewer);
  const organization =
    stub.organization instanceof Error
      ? Promise.reject(stub.organization)
      : Promise.resolve(stub.organization);

  let listTeamsCallCount = 0;
  const gateway = {
    async listTeams() {
      const configured = stub.listTeams ?? [];
      const page = configured[listTeamsCallCount];
      listTeamsCallCount += 1;

      if (page && typeof page === "object" && "items" in page && Array.isArray(page.items)) {
        return page;
      }

      return { items: configured, nextCursor: null };
    },
  };

  return {
    profile: "default",
    client: { viewer, organization } as unknown as ActiveSession["client"],
    gateway: gateway as unknown as ActiveSession["gateway"],
    credentials: { accessToken: "x" },
  };
}

function makeManager(overrides: {
  status: AuthStatus;
  session?: ActiveSession | Error;
  profileTeam?: string;
  profileMissing?: boolean;
}): AuthStatusReportManager {
  return {
    async status() {
      return overrides.status;
    },
    async openSession() {
      if (overrides.session instanceof Error) throw overrides.session;
      if (!overrides.session) throw new Error("no session configured");
      return overrides.session;
    },
    async getProfile() {
      if (overrides.profileMissing) return undefined;
      return overrides.profileTeam ? { team: overrides.profileTeam } : {};
    },
  };
}

describe("buildAuthStatusReport", () => {
  test("authenticated profile with team resolved by configured key", async () => {
    const session = makeSession({
      viewer: { id: "u1", name: "Dan", displayName: "Daniel", email: "dan@example.com" },
      organization: { id: "org-1", name: "Acme", urlKey: "acme" },
      listTeams: [{ id: "t1", key: "ENG", name: "Engineering" }],
    });
    const manager = makeManager({
      status: baseAuthenticatedStatus,
      session,
      profileTeam: "ENG",
    });

    const report = await buildAuthStatusReport(manager);

    expect(report.user).toEqual({ id: "u1", name: "Daniel", email: "dan@example.com" });
    expect(report.workspace).toEqual({ id: "org-1", name: "Acme", urlKey: "acme" });
    expect(report.defaultTeam).toEqual({ id: "t1", key: "ENG", name: "Engineering" });
    expect(report.profile).toBe("default");
  });

  test("authenticated profile with no team configured returns null defaultTeam", async () => {
    const session = makeSession({
      viewer: { id: "u1", name: "Dan", email: "dan@example.com" },
      organization: { id: "org-1", name: "Acme", urlKey: "acme" },
    });
    const manager = makeManager({ status: baseAuthenticatedStatus, session });

    const report = await buildAuthStatusReport(manager);
    expect(report.defaultTeam).toBeNull();
  });

  test("unauthenticated profile returns null live fields and base status", async () => {
    const manager = makeManager({ status: unauthenticatedStatus });
    const report = await buildAuthStatusReport(manager);

    expect(report.user).toBeNull();
    expect(report.workspace).toBeNull();
    expect(report.defaultTeam).toBeNull();
    expect(report.hasAccessToken).toBe(false);
    expect(report.profile).toBe("default");
  });

  test("viewer rejection still produces ok report with user null", async () => {
    const session = makeSession({
      viewer: new Error("boom"),
      organization: { id: "org-1", name: "Acme", urlKey: "acme" },
    });
    const manager = makeManager({ status: baseAuthenticatedStatus, session });

    const report = await buildAuthStatusReport(manager);
    expect(report.user).toBeNull();
    expect(report.workspace).toEqual({ id: "org-1", name: "Acme", urlKey: "acme" });
  });

  test("default team key resolves from the teams page", async () => {
    const session = makeSession({
      viewer: { id: "u1", name: "Dan", email: "dan@example.com" },
      organization: { id: "org-1", name: "Acme", urlKey: "acme" },
      listTeams: [
        { id: "t-other", key: "OPS", name: "Ops" },
        { id: "t1", key: "ENG", name: "Engineering" },
      ],
    });
    const manager = makeManager({
      status: baseAuthenticatedStatus,
      session,
      profileTeam: "ENG",
    });

    const report = await buildAuthStatusReport(manager);
    expect(report.defaultTeam).toEqual({ id: "t1", key: "ENG", name: "Engineering" });
  });

  test("default team key lookup checks subsequent team pages", async () => {
    const session = makeSession({
      viewer: { id: "u1", name: "Dan", email: "dan@example.com" },
      organization: { id: "org-1", name: "Acme", urlKey: "acme" },
      listTeams: [
        {
          items: [{ id: "t-other", key: "OPS", name: "Ops" }],
          nextCursor: "cursor-2",
        },
        {
          items: [{ id: "t1", key: "ENG", name: "Engineering" }],
          nextCursor: null,
        },
      ],
    });
    const manager = makeManager({
      status: baseAuthenticatedStatus,
      session,
      profileTeam: "ENG",
    });

    const report = await buildAuthStatusReport(manager);
    expect(report.defaultTeam).toEqual({ id: "t1", key: "ENG", name: "Engineering" });
  });

  test("openSession failure degrades to null live fields without throwing", async () => {
    const manager = makeManager({
      status: baseAuthenticatedStatus,
      session: new Error("nope"),
    });

    const report = await buildAuthStatusReport(manager);
    expect(report.user).toBeNull();
    expect(report.workspace).toBeNull();
    expect(report.defaultTeam).toBeNull();
  });
});
