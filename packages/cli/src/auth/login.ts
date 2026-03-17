import { createServer } from "node:http";
import { URL } from "node:url";
import type { OAuthProfileConfig } from "@wiseiodev/linear-core";
import {
  buildAuthorizationUrl,
  createOAuthState,
  createPkcePair,
  parseManualAuthorizationInput,
} from "@wiseiodev/linear-core";

export const DEFAULT_AUTHORIZE_URL = "https://linear.app/oauth/authorize";
export const DEFAULT_TOKEN_URL = "https://api.linear.app/oauth/token";
export const DEFAULT_REDIRECT_URI = "http://127.0.0.1:8787/oauth/callback";
export const DEFAULT_SCOPES: readonly string[] = ["read", "write"];
export const DEFAULT_CLIENT_ID = "cb2fead8ab900e997cb990c52227c10c";

export interface OAuthConfigStore {
  getOAuthConfig(profile: string): Promise<OAuthProfileConfig | undefined>;
  saveOAuthConfig(profile: string, oauth: OAuthProfileConfig): Promise<void>;
  loginWithAuthorizationCode(
    fetcher: typeof fetch,
    input: {
      profile: string;
      clientId: string;
      tokenUrl: string;
      code: string;
      redirectUri: string;
      codeVerifier: string;
    },
  ): Promise<void>;
}

export interface InteractiveOAuthLoginResult {
  readonly profile: string;
  readonly method: "oauth";
  readonly authorizationUrl: string;
  readonly redirectUri: string;
  readonly browserOpened: boolean;
}

interface WaitForOAuthCallbackOptions {
  readonly redirectUri: string;
  readonly expectedState: string;
  readonly timeoutMs?: number;
}

export interface RunInteractiveOAuthLoginOptions {
  readonly profile: string;
  readonly manual: boolean;
  readonly clientId?: string;
  readonly redirectUri?: string;
  readonly scopes?: string;
  readonly authManager: OAuthConfigStore;
  readonly prompt: (message: string) => Promise<string>;
  readonly openBrowser: (target: string) => Promise<void>;
  readonly createPkcePair?: typeof createPkcePair;
  readonly createState?: typeof createOAuthState;
  readonly waitForOAuthCallback?: (
    options: WaitForOAuthCallbackOptions,
  ) => Promise<{ readonly code: string }>;
}

function parseScopeList(input: string | undefined, fallback: readonly string[]): string[] {
  if (typeof input !== "string") {
    return [...fallback];
  }

  const items = input
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return items.length > 0 ? items : [...fallback];
}

export async function waitForOAuthCallback(
  options: WaitForOAuthCallbackOptions,
): Promise<{ readonly code: string }> {
  const redirectUrl = new URL(options.redirectUri);
  const timeoutMs = options.timeoutMs ?? 120_000;

  return new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      const requestPath = request.url ?? "/";
      const callbackUrl = new URL(requestPath, options.redirectUri);

      if (callbackUrl.pathname !== redirectUrl.pathname) {
        response.statusCode = 404;
        response.end("Not found");
        return;
      }

      const code = callbackUrl.searchParams.get("code");
      const state = callbackUrl.searchParams.get("state");
      const error = callbackUrl.searchParams.get("error");

      if (error) {
        response.statusCode = 400;
        response.end("OAuth login failed. You can close this tab.");
        cleanup(new Error(`OAuth login failed: ${error}`));
        return;
      }

      if (!code || state !== options.expectedState) {
        response.statusCode = 400;
        response.end("OAuth callback was invalid. You can close this tab.");
        cleanup(new Error("OAuth callback was invalid."));
        return;
      }

      response.statusCode = 200;
      response.end("Linear CLI login complete. You can close this tab.");
      cleanup(undefined, { code });
    });

    const timer = setTimeout(() => {
      cleanup(new Error("Timed out waiting for OAuth callback."));
    }, timeoutMs);

    function cleanup(error?: Error, result?: { readonly code: string }): void {
      clearTimeout(timer);
      server.close(() => {
        if (result) {
          resolve(result);
          return;
        }

        reject(error ?? new Error("OAuth callback failed."));
      });
    }

    server.on("error", (error) => {
      cleanup(error);
    });

    const portValue = Number.parseInt(redirectUrl.port, 10);
    const port = Number.isFinite(portValue) ? portValue : 80;

    server.listen(port, redirectUrl.hostname);
  });
}

export async function runInteractiveOAuthLogin(
  options: RunInteractiveOAuthLoginOptions,
): Promise<InteractiveOAuthLoginResult> {
  const existingConfig = await options.authManager.getOAuthConfig(options.profile);

  const clientId = options.clientId ?? existingConfig?.clientId ?? DEFAULT_CLIENT_ID;
  const redirectUri = options.redirectUri ?? existingConfig?.redirectUri ?? DEFAULT_REDIRECT_URI;
  const scopes = parseScopeList(options.scopes, existingConfig?.scopes ?? DEFAULT_SCOPES);
  const oauthConfig: OAuthProfileConfig = {
    clientId,
    authorizeUrl: existingConfig?.authorizeUrl ?? DEFAULT_AUTHORIZE_URL,
    tokenUrl: existingConfig?.tokenUrl ?? DEFAULT_TOKEN_URL,
    redirectUri,
    scopes,
    actor: "user",
  };

  await options.authManager.saveOAuthConfig(options.profile, oauthConfig);

  const pkce = (options.createPkcePair ?? createPkcePair)();
  const state = (options.createState ?? createOAuthState)();
  const authorizationUrl = buildAuthorizationUrl(oauthConfig, state, pkce.challenge);

  let browserOpened = false;
  try {
    await options.openBrowser(authorizationUrl);
    browserOpened = true;
  } catch {
    browserOpened = false;
  }

  let code: string;
  if (options.manual) {
    const input = await options.prompt(
      `Open this URL to authorize the CLI, then paste the callback URL or authorization code:\n${authorizationUrl}\n> `,
    );
    code = parseManualAuthorizationInput(input, state).code;
  } else {
    try {
      const waitForCode = options.waitForOAuthCallback ?? waitForOAuthCallback;
      code = (
        await waitForCode({
          redirectUri: oauthConfig.redirectUri,
          expectedState: state,
        })
      ).code;
    } catch {
      const input = await options.prompt(
        `Login could not capture the browser callback. Open this URL, then paste the callback URL or authorization code:\n${authorizationUrl}\n> `,
      );
      code = parseManualAuthorizationInput(input, state).code;
    }
  }

  await options.authManager.loginWithAuthorizationCode(fetch, {
    profile: options.profile,
    clientId: oauthConfig.clientId,
    tokenUrl: oauthConfig.tokenUrl,
    code,
    redirectUri: oauthConfig.redirectUri,
    codeVerifier: pkce.verifier,
  });

  return {
    profile: options.profile,
    method: "oauth",
    authorizationUrl,
    redirectUri: oauthConfig.redirectUri,
    browserOpened,
  };
}
