import type { CredentialStore, StoredCredentials } from "./types.js";

const SERVICE_NAME = "linear-agent-cli";

interface KeytarModule {
  getPassword(service: string, account: string): Promise<string | null>;
  setPassword(service: string, account: string, password: string): Promise<void>;
  deletePassword(service: string, account: string): Promise<boolean>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isKeytarModule(value: unknown): value is KeytarModule {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.getPassword === "function" &&
    typeof value.setPassword === "function" &&
    typeof value.deletePassword === "function"
  );
}

function toStoredCredentials(value: unknown): StoredCredentials {
  if (!isRecord(value)) {
    return {};
  }

  return {
    accessToken: typeof value.accessToken === "string" ? value.accessToken : undefined,
    refreshToken: typeof value.refreshToken === "string" ? value.refreshToken : undefined,
    expiresAt: typeof value.expiresAt === "string" ? value.expiresAt : undefined,
    apiKey: typeof value.apiKey === "string" ? value.apiKey : undefined,
  };
}

export class KeychainCredentialStore implements CredentialStore {
  private readonly keytar: KeytarModule;

  public constructor(keytar: KeytarModule) {
    this.keytar = keytar;
  }

  public static async create(): Promise<KeychainCredentialStore | null> {
    try {
      const module = await import("keytar");
      if (!isKeytarModule(module)) {
        return null;
      }
      return new KeychainCredentialStore(module);
    } catch {
      return null;
    }
  }

  public async get(profile: string): Promise<StoredCredentials | null> {
    const value = await this.keytar.getPassword(SERVICE_NAME, profile);
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      return toStoredCredentials(parsed);
    } catch {
      return null;
    }
  }

  public async set(profile: string, credentials: StoredCredentials): Promise<void> {
    await this.keytar.setPassword(SERVICE_NAME, profile, JSON.stringify(credentials));
  }

  public async clear(profile: string): Promise<void> {
    await this.keytar.deletePassword(SERVICE_NAME, profile);
  }
}
