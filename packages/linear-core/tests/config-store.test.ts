import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { ConfigStore } from "../src/config/config-store.js";
import { parseAppConfig } from "../src/config/schema.js";

describe("ConfigStore", () => {
  test("returns default config when file is missing", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "linear-config-"));
    const store = new ConfigStore(path.join(tempDir, "config.json"));

    const config = await store.load();

    expect(config.version).toBe(2);
    expect(config.defaultProfile).toBe("default");
    expect(config.profiles.default?.name).toBe("default");
    expect(config.profiles.default?.preferredAuth).toBe("oauth");
  });

  test("upserts and retrieves profile", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "linear-config-"));
    const store = new ConfigStore(path.join(tempDir, "config.json"));

    await store.upsertProfile({
      name: "agent",
      team: "ENG",
    });

    const profile = await store.getProfile("agent");
    expect(profile.name).toBe("agent");
    expect(profile.team).toBe("ENG");
  });

  test("migrates legacy config format", () => {
    const migrated = parseAppConfig({
      defaultProfile: "legacy",
      profiles: {
        legacy: {
          team: "CORE",
        },
      },
    });

    expect(migrated.version).toBe(2);
    expect(migrated.defaultProfile).toBe("legacy");
    expect(migrated.profiles.legacy?.name).toBe("legacy");
    expect(migrated.profiles.legacy?.team).toBe("CORE");
    expect(migrated.profiles.legacy?.preferredAuth).toBe("oauth");
  });

  test("preserves oauth profile configuration in version 2 config", () => {
    const migrated = parseAppConfig({
      version: 2,
      defaultProfile: "agent",
      profiles: {
        agent: {
          name: "agent",
          team: "ENG",
          preferredAuth: "oauth",
          oauth: {
            clientId: "client-1",
            authorizeUrl: "https://linear.app/oauth/authorize",
            tokenUrl: "https://api.linear.app/oauth/token",
            redirectUri: "http://127.0.0.1:8787/oauth/callback",
            scopes: ["read", "write"],
            actor: "user",
          },
        },
      },
    });

    expect(migrated.version).toBe(2);
    expect(migrated.profiles.agent?.oauth?.clientId).toBe("client-1");
    expect(migrated.profiles.agent?.oauth?.actor).toBe("user");
    expect(migrated.profiles.agent?.oauth?.scopes).toEqual(["read", "write"]);
  });
});
