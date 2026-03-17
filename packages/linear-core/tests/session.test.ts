import { describe, expect, test, vi } from "vitest";
import { AuthManager } from "../src/auth/session.js";
import { ConfigStore } from "../src/config/config-store.js";
import type { StoredCredentials } from "../src/token-store/types.js";

function createMemoryStore(initial: Record<string, StoredCredentials>) {
  const state = new Map(Object.entries(initial));

  return {
    state,
    async get(profile: string) {
      return state.get(profile) ?? null;
    },
    async set(profile: string, credentials: StoredCredentials) {
      state.set(profile, credentials);
    },
    async clear(profile: string) {
      state.delete(profile);
    },
  };
}

describe("AuthManager", () => {
  test("prefers stored oauth credentials over stored api key", async () => {
    const configStore = new ConfigStore("/tmp/linear-auth-config-unused.json");
    vi.spyOn(configStore, "load").mockResolvedValue({
      version: 2,
      defaultProfile: "default",
      profiles: {
        default: {
          name: "default",
          preferredAuth: "oauth",
          oauth: {
            clientId: "client-1",
            authorizeUrl: "https://linear.app/oauth/authorize",
            tokenUrl: "https://api.linear.app/oauth/token",
            redirectUri: "http://127.0.0.1:8787/oauth/callback",
            scopes: ["read", "write"],
            actor: "user",
          },
        },
      },
    });

    const credentialStore = createMemoryStore({
      default: {
        accessToken: "oauth-access",
        apiKey: "api-key",
      },
    });

    const manager = new AuthManager(configStore, Promise.resolve(credentialStore));
    const session = await manager.openSession();

    expect(session.credentials.accessToken).toBe("oauth-access");
    expect(session.credentials.apiKey).toBeUndefined();
  });

  test("refreshes expired oauth token using stored profile config", async () => {
    const configStore = new ConfigStore("/tmp/linear-auth-config-unused.json");
    vi.spyOn(configStore, "load").mockResolvedValue({
      version: 2,
      defaultProfile: "default",
      profiles: {
        default: {
          name: "default",
          preferredAuth: "oauth",
          oauth: {
            clientId: "client-1",
            authorizeUrl: "https://linear.app/oauth/authorize",
            tokenUrl: "https://api.linear.app/oauth/token",
            redirectUri: "http://127.0.0.1:8787/oauth/callback",
            scopes: ["read", "write"],
            actor: "user",
          },
        },
      },
    });

    const credentialStore = createMemoryStore({
      default: {
        accessToken: "expired-access",
        refreshToken: "refresh-me",
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
      },
    });

    const fetchMock = vi.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            access_token: "fresh-access",
            refresh_token: "fresh-refresh",
            expires_in: 600,
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const manager = new AuthManager(configStore, Promise.resolve(credentialStore));
    const session = await manager.openSession();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(session.credentials.accessToken).toBe("fresh-access");
    expect(session.credentials.refreshToken).toBe("fresh-refresh");
    expect(credentialStore.state.get("default")?.accessToken).toBe("fresh-access");
    vi.unstubAllGlobals();
  });
});
