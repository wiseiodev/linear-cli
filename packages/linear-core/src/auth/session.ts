import { LinearClient } from "@linear/sdk";
import { ConfigStore } from "../config/config-store.js";
import { LinearGateway } from "../entities/linear-gateway.js";
import { LinearCoreError } from "../errors/core-error.js";
import { createCredentialStore } from "../token-store/composite-store.js";
import type { CredentialStore, StoredCredentials } from "../token-store/types.js";
import {
  exchangeAuthorizationCode,
  isTokenExpired,
  type OAuthToken,
  refreshOAuthToken,
} from "./oauth.js";

export interface AuthStatus {
  readonly profile: string;
  readonly hasApiKey: boolean;
  readonly hasAccessToken: boolean;
  readonly hasRefreshToken: boolean;
  readonly expiresAt?: string;
}

export interface AuthLoginWithTokenInput {
  readonly profile: string;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string;
}

export interface AuthLoginWithApiKeyInput {
  readonly profile: string;
  readonly apiKey: string;
}

export interface AuthorizationCodeLoginInput {
  readonly profile: string;
  readonly clientId: string;
  readonly tokenUrl: string;
  readonly code: string;
  readonly redirectUri: string;
  readonly codeVerifier: string;
}

export interface RefreshTokenInput {
  readonly profile: string;
  readonly clientId: string;
  readonly tokenUrl: string;
}

export interface ActiveSession {
  readonly profile: string;
  readonly client: LinearClient;
  readonly gateway: LinearGateway;
  readonly credentials: StoredCredentials;
}

function toStoredCredentials(token: OAuthToken): StoredCredentials {
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt: token.expiresAt,
  };
}

export class AuthManager {
  private readonly configStore: ConfigStore;
  private readonly credentialStorePromise: Promise<CredentialStore>;

  public constructor(
    configStore = new ConfigStore(),
    credentialStorePromise = createCredentialStore(),
  ) {
    this.configStore = configStore;
    this.credentialStorePromise = credentialStorePromise;
  }

  private async credentialsStore(): Promise<CredentialStore> {
    return this.credentialStorePromise;
  }

  public async loginWithApiKey(input: AuthLoginWithApiKeyInput): Promise<void> {
    await this.configStore.upsertProfile({ name: input.profile });
    const store = await this.credentialsStore();
    await store.set(input.profile, {
      apiKey: input.apiKey,
    });
  }

  public async loginWithToken(input: AuthLoginWithTokenInput): Promise<void> {
    await this.configStore.upsertProfile({ name: input.profile });
    const store = await this.credentialsStore();
    await store.set(input.profile, {
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt: input.expiresAt,
    });
  }

  public async loginWithAuthorizationCode(
    fetcher: typeof fetch,
    input: AuthorizationCodeLoginInput,
  ): Promise<void> {
    const token = await exchangeAuthorizationCode(fetcher, {
      clientId: input.clientId,
      tokenUrl: input.tokenUrl,
      code: input.code,
      redirectUri: input.redirectUri,
      codeVerifier: input.codeVerifier,
    });

    await this.loginWithToken({
      profile: input.profile,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: token.expiresAt,
    });
  }

  public async refreshToken(fetcher: typeof fetch, input: RefreshTokenInput): Promise<OAuthToken> {
    const store = await this.credentialsStore();
    const existing = await store.get(input.profile);

    if (!existing?.refreshToken) {
      throw new LinearCoreError(
        "AUTH_REQUIRED",
        `No refresh token found for profile ${input.profile}`,
      );
    }

    const nextToken = await refreshOAuthToken(fetcher, {
      clientId: input.clientId,
      tokenUrl: input.tokenUrl,
      refreshToken: existing.refreshToken,
    });

    await store.set(input.profile, {
      ...existing,
      ...toStoredCredentials(nextToken),
    });

    return nextToken;
  }

  public async logout(profile: string): Promise<void> {
    const store = await this.credentialsStore();
    await store.clear(profile);
  }

  public async status(profile?: string): Promise<AuthStatus> {
    const config = await this.configStore.load();
    const selectedProfile = profile ?? config.defaultProfile;
    const store = await this.credentialsStore();
    const credentials = await store.get(selectedProfile);

    return {
      profile: selectedProfile,
      hasApiKey: typeof credentials?.apiKey === "string",
      hasAccessToken: typeof credentials?.accessToken === "string",
      hasRefreshToken: typeof credentials?.refreshToken === "string",
      expiresAt: credentials?.expiresAt,
    };
  }

  public async openSession(options?: {
    readonly profile?: string;
    readonly tokenUrl?: string;
    readonly clientId?: string;
  }): Promise<ActiveSession> {
    const config = await this.configStore.load();
    const selectedProfile = options?.profile ?? config.defaultProfile;
    const store = await this.credentialsStore();
    const credentials = await store.get(selectedProfile);

    const envApiKey = process.env.LINEAR_API_KEY;

    if (credentials?.apiKey || envApiKey) {
      const apiKey = credentials?.apiKey ?? envApiKey;
      if (!apiKey) {
        throw new LinearCoreError("AUTH_REQUIRED", "Missing API key");
      }

      const client = new LinearClient({ apiKey });
      return {
        profile: selectedProfile,
        client,
        gateway: new LinearGateway(client),
        credentials: {
          apiKey,
        },
      };
    }

    if (!credentials?.accessToken) {
      throw new LinearCoreError(
        "AUTH_REQUIRED",
        `No credentials found for profile ${selectedProfile}. Use auth login first.`,
      );
    }

    let token: OAuthToken = {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      expiresAt: credentials.expiresAt,
    };

    const shouldRefresh = isTokenExpired(token);
    if (shouldRefresh && token.refreshToken && options?.tokenUrl && options?.clientId) {
      const refreshed = await refreshOAuthToken(fetch, {
        clientId: options.clientId,
        tokenUrl: options.tokenUrl,
        refreshToken: token.refreshToken,
      });
      token = refreshed;
      await store.set(selectedProfile, {
        ...credentials,
        ...toStoredCredentials(refreshed),
      });
    }

    const client = new LinearClient({
      accessToken: token.accessToken,
    });

    return {
      profile: selectedProfile,
      client,
      gateway: new LinearGateway(client),
      credentials: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.expiresAt,
      },
    };
  }
}
