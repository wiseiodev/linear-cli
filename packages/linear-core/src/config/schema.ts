import path from "node:path";
import { z } from "zod";
import { LinearCoreError } from "../errors/core-error.js";
import { getConfigRoot } from "../utils/filesystem.js";

const oauthConfigSchema = z.object({
  clientId: z.string().min(1),
  authorizeUrl: z.string().url(),
  tokenUrl: z.string().url(),
  redirectUri: z.string().url(),
  scopes: z.array(z.string().min(1)).min(1),
  actor: z.literal("user"),
});

const profileSchema = z.object({
  name: z.string().min(1),
  team: z.string().min(1).optional(),
  defaultLimit: z.number().int().positive().max(250).optional(),
  preferredAuth: z.enum(["oauth", "api-key"]).default("oauth"),
  oauth: oauthConfigSchema.optional(),
});

const appConfigSchema = z.object({
  version: z.literal(2),
  defaultProfile: z.string().min(1),
  profiles: z.record(z.string(), profileSchema),
});

export type OAuthProfileConfig = z.infer<typeof oauthConfigSchema>;
export type ProfileConfig = z.infer<typeof profileSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;

const legacyProfileSchema = z.object({
  name: z.string().min(1).optional(),
  team: z.string().min(1).optional(),
  defaultLimit: z.number().int().positive().max(250).optional(),
});

const legacyConfigSchema = z.object({
  version: z.literal(1).optional(),
  defaultProfile: z.string().min(1).optional(),
  profiles: z.record(z.string(), legacyProfileSchema).optional(),
});

function defaultProfileConfig(name: string): ProfileConfig {
  return {
    name,
    preferredAuth: "oauth",
  };
}

export function defaultAppConfig(): AppConfig {
  return {
    version: 2,
    defaultProfile: "default",
    profiles: {
      default: defaultProfileConfig("default"),
    },
  };
}

export function getConfigPath(): string {
  return path.join(getConfigRoot(), "config.json");
}

export function parseAppConfig(data: unknown): AppConfig {
  const parsed = appConfigSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  const legacy = legacyConfigSchema.safeParse(data);
  if (legacy.success) {
    const rawProfiles = legacy.data.profiles ?? {};
    const normalizedProfiles: Record<string, ProfileConfig> = {};

    for (const [key, value] of Object.entries(rawProfiles)) {
      normalizedProfiles[key] = {
        ...defaultProfileConfig(key),
        name: value.name ?? key,
        team: value.team,
        defaultLimit: value.defaultLimit,
      };
    }

    if (Object.keys(normalizedProfiles).length === 0) {
      normalizedProfiles.default = defaultProfileConfig("default");
    }

    const defaultProfile =
      legacy.data.defaultProfile && normalizedProfiles[legacy.data.defaultProfile]
        ? legacy.data.defaultProfile
        : (Object.keys(normalizedProfiles)[0] ?? "default");

    return {
      version: 2,
      defaultProfile,
      profiles: normalizedProfiles,
    };
  }

  throw new LinearCoreError("CONFIG_INVALID", "Invalid config file format");
}
