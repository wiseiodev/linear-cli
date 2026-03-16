import { readJsonFile, writeJsonFile } from "../utils/filesystem.js";
import { type CredentialStore, getCredentialsPath, type StoredCredentials } from "./types.js";

interface CredentialFileShape {
  readonly version: 1;
  readonly profiles: Readonly<Record<string, StoredCredentials>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function toCredentialFile(value: unknown): CredentialFileShape {
  if (!isRecord(value)) {
    return {
      version: 1,
      profiles: {},
    };
  }

  const version = value.version;
  const profiles = value.profiles;

  if (version === 1 && isRecord(profiles)) {
    const normalizedProfiles: Record<string, StoredCredentials> = {};
    for (const [profile, credentials] of Object.entries(profiles)) {
      if (!isRecord(credentials)) {
        continue;
      }
      normalizedProfiles[profile] = {
        accessToken:
          typeof credentials.accessToken === "string" ? credentials.accessToken : undefined,
        refreshToken:
          typeof credentials.refreshToken === "string" ? credentials.refreshToken : undefined,
        expiresAt: typeof credentials.expiresAt === "string" ? credentials.expiresAt : undefined,
        apiKey: typeof credentials.apiKey === "string" ? credentials.apiKey : undefined,
      };
    }

    return {
      version: 1,
      profiles: normalizedProfiles,
    };
  }

  return {
    version: 1,
    profiles: {},
  };
}

export class FileCredentialStore implements CredentialStore {
  private readonly filePath: string;

  public constructor(filePath = getCredentialsPath()) {
    this.filePath = filePath;
  }

  private async readState(): Promise<CredentialFileShape> {
    const raw = await readJsonFile(this.filePath);
    return toCredentialFile(raw);
  }

  private async writeState(state: CredentialFileShape): Promise<void> {
    await writeJsonFile(this.filePath, state, 0o600);
  }

  public async get(profile: string): Promise<StoredCredentials | null> {
    const state = await this.readState();
    return state.profiles[profile] ?? null;
  }

  public async set(profile: string, credentials: StoredCredentials): Promise<void> {
    const state = await this.readState();
    const next: CredentialFileShape = {
      version: 1,
      profiles: {
        ...state.profiles,
        [profile]: credentials,
      },
    };

    await this.writeState(next);
  }

  public async clear(profile: string): Promise<void> {
    const state = await this.readState();
    const nextProfiles: Record<string, StoredCredentials> = {};

    for (const [key, value] of Object.entries(state.profiles)) {
      if (key !== profile) {
        nextProfiles[key] = value;
      }
    }

    await this.writeState({
      version: 1,
      profiles: nextProfiles,
    });
  }
}
