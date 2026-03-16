import path from "node:path";
import { z } from "zod";
import { LinearCoreError } from "../errors/core-error.js";
import { getConfigRoot } from "../utils/filesystem.js";

const profileSchema = z.object({
  name: z.string().min(1),
  team: z.string().min(1).optional(),
  defaultLimit: z.number().int().positive().max(250).optional(),
});

const appConfigSchema = z.object({
  version: z.literal(1),
  defaultProfile: z.string().min(1),
  profiles: z.record(z.string(), profileSchema),
});

export type ProfileConfig = z.infer<typeof profileSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;

const legacyConfigSchema = z.object({
  defaultProfile: z.string().min(1).optional(),
  profiles: z
    .record(
      z.string(),
      z.object({
        name: z.string().min(1).optional(),
        team: z.string().min(1).optional(),
        defaultLimit: z.number().int().positive().max(250).optional(),
      }),
    )
    .optional(),
});

export function defaultAppConfig(): AppConfig {
  return {
    version: 1,
    defaultProfile: "default",
    profiles: {
      default: {
        name: "default",
      },
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
        name: value.name ?? key,
        team: value.team,
        defaultLimit: value.defaultLimit,
      };
    }

    if (Object.keys(normalizedProfiles).length === 0) {
      normalizedProfiles.default = { name: "default" };
    }

    const defaultProfile =
      legacy.data.defaultProfile && normalizedProfiles[legacy.data.defaultProfile]
        ? legacy.data.defaultProfile
        : (Object.keys(normalizedProfiles)[0] ?? "default");

    return {
      version: 1,
      defaultProfile,
      profiles: normalizedProfiles,
    };
  }

  throw new LinearCoreError("CONFIG_INVALID", "Invalid config file format");
}
