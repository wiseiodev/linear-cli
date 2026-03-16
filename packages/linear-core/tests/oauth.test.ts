import { describe, expect, test } from "vitest";
import {
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  isTokenExpired,
  refreshOAuthToken,
} from "../src/auth/oauth.js";

describe("oauth", () => {
  test("builds authorization url with pkce parameters", () => {
    const url = buildAuthorizationUrl(
      {
        clientId: "client-1",
        authorizeUrl: "https://linear.app/oauth/authorize",
        tokenUrl: "https://api.linear.app/oauth/token",
        redirectUri: "http://localhost/callback",
        scopes: ["read", "write"],
      },
      "state-1",
      "challenge-1",
    );

    expect(url).toContain("response_type=code");
    expect(url).toContain("client_id=client-1");
    expect(url).toContain("state=state-1");
    expect(url).toContain("code_challenge=challenge-1");
  });

  test("exchanges authorization code", async () => {
    const fetcher: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          access_token: "access",
          refresh_token: "refresh",
          token_type: "Bearer",
          expires_in: 3600,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );

    const token = await exchangeAuthorizationCode(fetcher, {
      clientId: "client-1",
      tokenUrl: "https://api.linear.app/oauth/token",
      code: "code-1",
      redirectUri: "http://localhost/callback",
      codeVerifier: "verifier",
    });

    expect(token.accessToken).toBe("access");
    expect(token.refreshToken).toBe("refresh");
    expect(token.expiresAt).toBeTypeOf("string");
  });

  test("refreshes token and keeps refresh token when absent in response", async () => {
    const fetcher: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          access_token: "next",
          expires_in: 120,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      );

    const token = await refreshOAuthToken(fetcher, {
      clientId: "client-1",
      tokenUrl: "https://api.linear.app/oauth/token",
      refreshToken: "keep-me",
    });

    expect(token.accessToken).toBe("next");
    expect(token.refreshToken).toBe("keep-me");
  });

  test("checks expiration", () => {
    const expired = isTokenExpired({
      accessToken: "x",
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
    });

    const active = isTokenExpired({
      accessToken: "x",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    expect(expired).toBe(true);
    expect(active).toBe(false);
  });
});
