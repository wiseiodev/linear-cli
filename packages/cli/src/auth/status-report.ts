import type { ActiveSession, AuthStatus } from "@wiseiodev/linear-core";

export interface AuthStatusUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface AuthStatusWorkspace {
  readonly id: string;
  readonly name: string;
  readonly urlKey: string;
}

export interface AuthStatusTeam {
  readonly id: string;
  readonly key: string;
  readonly name: string;
}

export interface AuthStatusReport extends AuthStatus {
  readonly user: AuthStatusUser | null;
  readonly workspace: AuthStatusWorkspace | null;
  readonly defaultTeam: AuthStatusTeam | null;
}

export interface AuthStatusReportManager {
  status(profile?: string): Promise<AuthStatus>;
  openSession(options?: { readonly profile?: string }): Promise<ActiveSession>;
  getProfile(profile?: string): Promise<{ readonly team?: string } | undefined>;
}

async function fetchUser(session: ActiveSession): Promise<AuthStatusUser | null> {
  try {
    const viewer = await session.client.viewer;
    return {
      id: viewer.id,
      name: viewer.displayName ?? viewer.name,
      email: viewer.email,
    };
  } catch {
    return null;
  }
}

async function fetchWorkspace(session: ActiveSession): Promise<AuthStatusWorkspace | null> {
  try {
    const organization = await session.client.organization;
    return {
      id: organization.id,
      name: organization.name,
      urlKey: organization.urlKey,
    };
  } catch {
    return null;
  }
}

async function fetchDefaultTeam(
  session: ActiveSession,
  teamKey: string | undefined,
): Promise<AuthStatusTeam | null> {
  if (!teamKey) {
    return null;
  }

  try {
    let cursor: string | undefined;
    do {
      const page = await session.gateway.listTeams({ limit: 250, cursor });
      const found = page.items.find((team) => team.key === teamKey);
      if (found) {
        return { id: found.id, key: found.key, name: found.name };
      }
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
  } catch {}

  return null;
}

export async function buildAuthStatusReport(
  authManager: AuthStatusReportManager,
  profile?: string,
): Promise<AuthStatusReport> {
  const status = await authManager.status(profile);

  if (!status.hasAccessToken && !status.hasApiKey) {
    return { ...status, user: null, workspace: null, defaultTeam: null };
  }

  let session: ActiveSession;
  try {
    session = await authManager.openSession({ profile });
  } catch {
    return { ...status, user: null, workspace: null, defaultTeam: null };
  }

  const profileConfig = await authManager.getProfile(profile);
  const [user, workspace, defaultTeam] = await Promise.all([
    fetchUser(session),
    fetchWorkspace(session),
    fetchDefaultTeam(session, profileConfig?.team),
  ]);

  return { ...status, user, workspace, defaultTeam };
}
