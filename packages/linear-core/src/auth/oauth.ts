import { URLSearchParams } from "node:url";
import { z } from "zod";
import { LinearCoreError } from "../errors/core-error.js";

export interface OAuthClientConfig {
  readonly clientId: string;
  readonly authorizeUrl: string;
  readonly tokenUrl: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
}

export interface OAuthToken {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string;
  readonly tokenType?: string;
}

interface TokenExchangeInput {
  readonly clientId: string;
  readonly tokenUrl: string;
  readonly code: string;
  readonly redirectUri: string;
  readonly codeVerifier: string;
}

interface TokenRefreshInput {
  readonly clientId: string;
  readonly tokenUrl: string;
  readonly refreshToken: string;
}

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().int().positive().optional(),
});

function computeExpiresAt(expiresInSeconds?: number): string | undefined {
  if (!expiresInSeconds) {
    return undefined;
  }

  const now = Date.now();
  const expiresAtMs = now + expiresInSeconds * 1000;
  return new Date(expiresAtMs).toISOString();
}

function buildTokenPayload(parsed: z.infer<typeof tokenResponseSchema>): OAuthToken {
  return {
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token,
    expiresAt: computeExpiresAt(parsed.expires_in),
    tokenType: parsed.token_type,
  };
}

export function buildAuthorizationUrl(
  config: OAuthClientConfig,
  state: string,
  codeChallenge: string,
): string {
  const query = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  return `${config.authorizeUrl}?${query.toString()}`;
}

async function parseTokenResponse(response: Response): Promise<OAuthToken> {
  if (!response.ok) {
    const body = await response.text();
    throw new LinearCoreError("TOKEN_EXCHANGE_FAILED", `OAuth token endpoint failed: ${body}`);
  }

  const json = await response.json();
  const parsed = tokenResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new LinearCoreError("TOKEN_EXCHANGE_FAILED", "Invalid OAuth token response");
  }

  return buildTokenPayload(parsed.data);
}

export async function exchangeAuthorizationCode(
  fetcher: typeof fetch,
  input: TokenExchangeInput,
): Promise<OAuthToken> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: input.clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
  });

  const response = await fetcher(input.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return parseTokenResponse(response);
}

export async function refreshOAuthToken(
  fetcher: typeof fetch,
  input: TokenRefreshInput,
): Promise<OAuthToken> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: input.clientId,
    refresh_token: input.refreshToken,
  });

  const response = await fetcher(input.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const token = await parseTokenResponse(response);
  return {
    ...token,
    refreshToken: token.refreshToken ?? input.refreshToken,
  };
}

export function isTokenExpired(token: OAuthToken): boolean {
  if (!token.expiresAt) {
    return false;
  }

  const expiresAt = Date.parse(token.expiresAt);
  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return expiresAt <= Date.now();
}
