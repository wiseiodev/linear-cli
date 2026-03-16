import path from "node:path";
import { getConfigRoot } from "../utils/filesystem.js";

export interface StoredCredentials {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly expiresAt?: string;
  readonly apiKey?: string;
}

export interface CredentialStore {
  get(profile: string): Promise<StoredCredentials | null>;
  set(profile: string, credentials: StoredCredentials): Promise<void>;
  clear(profile: string): Promise<void>;
}

export function getCredentialsPath(): string {
  return path.join(getConfigRoot(), "credentials.json");
}
