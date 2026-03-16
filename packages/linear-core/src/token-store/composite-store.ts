import { FileCredentialStore } from "./file-store.js";
import { KeychainCredentialStore } from "./keychain-store.js";
import type { CredentialStore, StoredCredentials } from "./types.js";

export class CompositeCredentialStore implements CredentialStore {
  private readonly primary: CredentialStore | null;
  private readonly fallback: CredentialStore;

  public constructor(primary: CredentialStore | null, fallback: CredentialStore) {
    this.primary = primary;
    this.fallback = fallback;
  }

  public async get(profile: string): Promise<StoredCredentials | null> {
    if (this.primary) {
      try {
        const primaryValue = await this.primary.get(profile);
        if (primaryValue) {
          return primaryValue;
        }
      } catch {
        // fall through to fallback
      }
    }

    return this.fallback.get(profile);
  }

  public async set(profile: string, credentials: StoredCredentials): Promise<void> {
    let primarySet = false;
    if (this.primary) {
      try {
        await this.primary.set(profile, credentials);
        primarySet = true;
      } catch {
        primarySet = false;
      }
    }

    if (!primarySet) {
      await this.fallback.set(profile, credentials);
    }
  }

  public async clear(profile: string): Promise<void> {
    if (this.primary) {
      try {
        await this.primary.clear(profile);
      } catch {
        // keep clearing fallback
      }
    }

    await this.fallback.clear(profile);
  }
}

export async function createCredentialStore(): Promise<CredentialStore> {
  const keychain = await KeychainCredentialStore.create();
  const fileStore = new FileCredentialStore();
  return new CompositeCredentialStore(keychain, fileStore);
}
