import { describe, expect, test, vi } from "vitest";
import { runInteractiveOAuthLogin } from "../src/auth/login.js";

describe("runInteractiveOAuthLogin", () => {
  test("uses the built-in WiseIO client id and completes manual login", async () => {
    const prompt = vi
      .fn<(message: string) => Promise<string>>()
      .mockResolvedValueOnce("http://127.0.0.1:8787/oauth/callback?code=code-1&state=state-1");
    const openBrowser = vi.fn<(target: string) => Promise<void>>().mockResolvedValue();
    const loginWithAuthorizationCode = vi
      .fn<
        (
          fetcher: typeof fetch,
          input: {
            profile: string;
            clientId: string;
            tokenUrl: string;
            code: string;
            redirectUri: string;
            codeVerifier: string;
          },
        ) => Promise<void>
      >()
      .mockResolvedValue();
    const saveOAuthConfig = vi
      .fn<
        (
          profile: string,
          oauth: {
            clientId: string;
            authorizeUrl: string;
            tokenUrl: string;
            redirectUri: string;
            scopes: readonly string[];
            actor: "user";
          },
        ) => Promise<void>
      >()
      .mockResolvedValue();

    const result = await runInteractiveOAuthLogin({
      profile: "default",
      manual: true,
      authManager: {
        async getOAuthConfig() {
          return undefined;
        },
        loginWithAuthorizationCode,
        saveOAuthConfig,
      },
      prompt,
      openBrowser,
      createPkcePair: () => ({
        verifier: "verifier-1",
        challenge: "challenge-1",
      }),
      createState: () => "state-1",
      waitForOAuthCallback: async () => {
        throw new Error("manual should not wait for callback");
      },
    });

    expect(saveOAuthConfig).toHaveBeenCalledWith(
      "default",
      expect.objectContaining({
        clientId: "cb2fead8ab900e997cb990c52227c10c",
        redirectUri: "http://127.0.0.1:8787/oauth/callback",
        scopes: ["read", "write"],
      }),
    );
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(openBrowser).toHaveBeenCalledTimes(1);
    expect(loginWithAuthorizationCode).toHaveBeenCalledWith(
      fetch,
      expect.objectContaining({
        profile: "default",
        clientId: "cb2fead8ab900e997cb990c52227c10c",
        code: "code-1",
        codeVerifier: "verifier-1",
      }),
    );
    expect(result.method).toBe("oauth");
  });
});
