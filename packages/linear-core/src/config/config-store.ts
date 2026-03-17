import { LinearCoreError } from "../errors/core-error.js";
import { readJsonFile, writeJsonFile } from "../utils/filesystem.js";
import {
  type AppConfig,
  defaultAppConfig,
  getConfigPath,
  type ProfileConfig,
  parseAppConfig,
} from "./schema.js";

export class ConfigStore {
  private readonly filePath: string;

  public constructor(filePath = getConfigPath()) {
    this.filePath = filePath;
  }

  public async load(): Promise<AppConfig> {
    const parsed = await readJsonFile(this.filePath);
    if (parsed === null) {
      return defaultAppConfig();
    }

    return parseAppConfig(parsed);
  }

  public async save(config: AppConfig): Promise<void> {
    await writeJsonFile(this.filePath, config, 0o600);
  }

  public async getProfile(profileName?: string): Promise<ProfileConfig> {
    const config = await this.load();
    const selected = profileName ?? config.defaultProfile;
    const profile = config.profiles[selected];

    if (!profile) {
      throw new LinearCoreError("CONFIG_NOT_FOUND", `Profile not found: ${selected}`);
    }

    return profile;
  }

  public async upsertProfile(profile: ProfileConfig): Promise<AppConfig> {
    const current = await this.load();
    const previous = current.profiles[profile.name];
    const next: AppConfig = {
      ...current,
      profiles: {
        ...current.profiles,
        [profile.name]: {
          ...previous,
          ...profile,
        },
      },
    };

    if (!current.profiles[current.defaultProfile]) {
      next.defaultProfile = profile.name;
    }

    await this.save(next);
    return next;
  }

  public async mergeProfile(
    profileName: string,
    update: Omit<Partial<ProfileConfig>, "name">,
  ): Promise<AppConfig> {
    const current = await this.load();
    const nextProfile: ProfileConfig = {
      name: profileName,
      preferredAuth: "oauth",
      ...current.profiles[profileName],
      ...update,
    };

    return this.upsertProfile(nextProfile);
  }

  public async setDefaultProfile(name: string): Promise<AppConfig> {
    const current = await this.load();
    if (!current.profiles[name]) {
      throw new LinearCoreError("CONFIG_NOT_FOUND", `Profile not found: ${name}`);
    }

    const next: AppConfig = {
      ...current,
      defaultProfile: name,
    };
    await this.save(next);
    return next;
  }
}
