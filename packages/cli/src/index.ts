import { createInterface } from "node:readline/promises";
import type {
  SdkAttachmentInput,
  SdkCommentInput,
  SdkCommentUpdateInput,
  SdkCycleInput,
  SdkCycleUpdateInput,
  SdkIssueInput,
  SdkIssueLabelInput,
  SdkIssueLabelUpdateInput,
  SdkIssueUpdateInput,
  SdkProjectInput,
  SdkProjectUpdateInput,
  SdkTeamInput,
  SdkTeamUpdateInput,
  SdkUserUpdateInput,
  SdkWorkflowStateInput,
  SdkWorkflowStateUpdateInput,
} from "@linear-agent/linear-core";
import {
  AuthManager,
  errorEnvelope,
  normalizeError,
  successEnvelope,
} from "@linear-agent/linear-core";
import { getSkill, installSkill, listSkills } from "@linear-agent/skills-catalog";
import { runLinearTui } from "@linear-agent/tui";
import { Command } from "commander";
import open from "open";
import { registerResourceCommand } from "./commands/resource.js";
import { renderEnvelope } from "./formatters/output.js";
import { rootHelpText } from "./help/root-help.js";
import { getGlobalOptions } from "./runtime/options.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function hasString(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "string";
}

function ensurePayload<T>(
  value: unknown,
  guard: (input: unknown) => input is T,
  message: string,
): T {
  if (!guard(value)) {
    throw new Error(message);
  }

  return value;
}

function isIssueCreateInput(value: unknown): value is SdkIssueInput {
  return isRecord(value) && hasString(value, "title") && hasString(value, "teamId");
}

function isIssueUpdateInput(value: unknown): value is SdkIssueUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isProjectCreateInput(value: unknown): value is SdkProjectInput {
  return isRecord(value) && hasString(value, "name");
}

function isProjectUpdateInput(value: unknown): value is SdkProjectUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isCycleCreateInput(value: unknown): value is SdkCycleInput {
  return isRecord(value) && hasString(value, "teamId");
}

function isCycleUpdateInput(value: unknown): value is SdkCycleUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isTeamCreateInput(value: unknown): value is SdkTeamInput {
  return isRecord(value) && hasString(value, "name") && hasString(value, "key");
}

function isTeamUpdateInput(value: unknown): value is SdkTeamUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isUserUpdateInput(value: unknown): value is SdkUserUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isLabelCreateInput(value: unknown): value is SdkIssueLabelInput {
  return isRecord(value) && hasString(value, "name");
}

function isLabelUpdateInput(value: unknown): value is SdkIssueLabelUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isCommentCreateInput(value: unknown): value is SdkCommentInput {
  return isRecord(value) && hasString(value, "body");
}

function isCommentUpdateInput(value: unknown): value is SdkCommentUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isAttachmentCreateInput(value: unknown): value is SdkAttachmentInput {
  return isRecord(value) && hasString(value, "title") && hasString(value, "url");
}

function isWorkflowStateCreateInput(value: unknown): value is SdkWorkflowStateInput {
  return isRecord(value) && hasString(value, "name") && hasString(value, "teamId");
}

function isWorkflowStateUpdateInput(value: unknown): value is SdkWorkflowStateUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

async function readSecret(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    return await rl.question(prompt);
  } finally {
    rl.close();
  }
}

export function createProgram(authManager = new AuthManager()): Command {
  const program = new Command();

  program
    .name("linear")
    .description("Agent-first Linear CLI")
    .addHelpText("after", rootHelpText)
    .option("--json", "Output JSON envelope")
    .option("--profile <name>", "Profile name to use")
    .option("--team <key>", "Default team key")
    .option("--limit <n>", "List limit", (value) => Number.parseInt(value, 10))
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--quiet", "Reduce human output noise");

  const authCommand = program.command("auth").description("Authentication commands");

  authCommand
    .command("api-key-set")
    .description("Store API key for profile")
    .option("--api-key <key>", "Linear API key")
    .action(async (opts, cmd) => {
      const globals = getGlobalOptions(cmd);
      const profile = globals.profile ?? "default";
      const apiKey = typeof opts.apiKey === "string" ? opts.apiKey : await readSecret("API key: ");

      await authManager.loginWithApiKey({
        profile,
        apiKey,
      });

      renderEnvelope(successEnvelope("auth", "set", { profile, method: "api-key" }), globals);
    });

  authCommand
    .command("login")
    .description("Store OAuth tokens for profile")
    .option("--access-token <token>", "OAuth access token")
    .option("--refresh-token <token>", "OAuth refresh token")
    .option("--expires-at <iso>", "Access token expiry in ISO format")
    .option("--authorization-code <code>", "OAuth authorization code")
    .option("--client-id <id>", "OAuth client id")
    .option("--token-url <url>", "OAuth token endpoint")
    .option("--redirect-uri <uri>", "OAuth redirect URI")
    .option("--code-verifier <value>", "PKCE code verifier")
    .action(async (opts, cmd) => {
      const globals = getGlobalOptions(cmd);
      const profile = globals.profile ?? "default";

      try {
        if (typeof opts.accessToken === "string") {
          await authManager.loginWithToken({
            profile,
            accessToken: opts.accessToken,
            refreshToken: typeof opts.refreshToken === "string" ? opts.refreshToken : undefined,
            expiresAt: typeof opts.expiresAt === "string" ? opts.expiresAt : undefined,
          });

          renderEnvelope(
            successEnvelope("auth", "login", { profile, method: "oauth-token" }),
            globals,
          );
          return;
        }

        if (
          typeof opts.authorizationCode === "string" &&
          typeof opts.clientId === "string" &&
          typeof opts.tokenUrl === "string" &&
          typeof opts.redirectUri === "string" &&
          typeof opts.codeVerifier === "string"
        ) {
          await authManager.loginWithAuthorizationCode(fetch, {
            profile,
            clientId: opts.clientId,
            tokenUrl: opts.tokenUrl,
            code: opts.authorizationCode,
            redirectUri: opts.redirectUri,
            codeVerifier: opts.codeVerifier,
          });

          renderEnvelope(
            successEnvelope("auth", "login", { profile, method: "oauth-authorization-code" }),
            globals,
          );
          return;
        }

        throw new Error(
          "Provide either --access-token or full authorization-code options (--authorization-code, --client-id, --token-url, --redirect-uri, --code-verifier).",
        );
      } catch (error) {
        const normalized = normalizeError(error);
        renderEnvelope(
          errorEnvelope("auth", "login", {
            code: normalized.code,
            message: normalized.message,
            details: normalized.details,
          }),
          globals,
        );
        process.exitCode = 1;
      }
    });

  authCommand
    .command("status")
    .description("Show authentication status")
    .action(async (_, cmd) => {
      const globals = getGlobalOptions(cmd);
      const status = await authManager.status(globals.profile);
      renderEnvelope(successEnvelope("auth", "status", status), globals);
    });

  authCommand
    .command("logout")
    .description("Clear credentials for profile")
    .action(async (_, cmd) => {
      const globals = getGlobalOptions(cmd);
      const profile = globals.profile ?? "default";
      await authManager.logout(profile);
      renderEnvelope(successEnvelope("auth", "logout", { profile }), globals);
    });

  program
    .command("docs")
    .description("Show official Linear docs links")
    .option("--open", "Open docs in browser")
    .action(async (opts, cmd) => {
      const globals = getGlobalOptions(cmd);
      const links = {
        sdk: "https://linear.app/developers/sdk",
        graphql: "https://linear.app/developers/graphql",
        schema: "https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql",
      };

      if (opts.open === true) {
        await open(links.sdk);
      }

      renderEnvelope(successEnvelope("docs", "show", links), globals);
    });

  const skillsCommand = program.command("skills").description("Skill catalog and installer");

  skillsCommand
    .command("list")
    .description("List bundled skills")
    .action((_, cmd) => {
      const globals = getGlobalOptions(cmd);
      renderEnvelope(successEnvelope("skills", "list", listSkills()), globals);
    });

  skillsCommand
    .command("show")
    .description("Show skill details")
    .argument("<name>", "Skill name")
    .action((name, _, cmd) => {
      const globals = getGlobalOptions(cmd);
      const skill = getSkill(name);

      if (!skill) {
        renderEnvelope(
          errorEnvelope("skills", "show", {
            code: "ENTITY_NOT_FOUND",
            message: `Skill not found: ${name}`,
          }),
          globals,
        );
        process.exitCode = 1;
        return;
      }

      renderEnvelope(successEnvelope("skills", "show", skill), globals);
    });

  skillsCommand
    .command("install")
    .description("Install a skill using Vercel Skills CLI")
    .argument("<name>", "Skill name")
    .action(async (name, _, cmd) => {
      const globals = getGlobalOptions(cmd);
      const result = await installSkill(name);

      if (!result.ok) {
        renderEnvelope(
          errorEnvelope("skills", "install", {
            code: "UNKNOWN",
            message: result.stderr || "Skill install failed",
          }),
          globals,
        );
        process.exitCode = 1;
        return;
      }

      renderEnvelope(successEnvelope("skills", "install", result), globals);
    });

  const sessionGateway = async (cmd: Command) => {
    const globals = getGlobalOptions(cmd);
    const session = await authManager.openSession({ profile: globals.profile });
    return session.gateway;
  };

  registerResourceCommand(
    program,
    "issues",
    "Issue commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listIssues({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getIssue(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createIssue(
          ensurePayload(
            payload,
            isIssueCreateInput,
            "Issue create payload requires title and teamId.",
          ),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateIssue(
          id,
          ensurePayload(
            payload,
            isIssueUpdateInput,
            "Issue update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteIssue(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "projects",
    "Project commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listProjects({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getProject(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createProject(
          ensurePayload(payload, isProjectCreateInput, "Project create payload requires name."),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateProject(
          id,
          ensurePayload(
            payload,
            isProjectUpdateInput,
            "Project update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteProject(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "cycles",
    "Cycle commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listCycles({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getCycle(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createCycle(
          ensurePayload(payload, isCycleCreateInput, "Cycle create payload requires teamId."),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateCycle(
          id,
          ensurePayload(
            payload,
            isCycleUpdateInput,
            "Cycle update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteCycle(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "teams",
    "Team commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listTeams({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getTeam(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createTeam(
          ensurePayload(payload, isTeamCreateInput, "Team create payload requires name and key."),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateTeam(
          id,
          ensurePayload(
            payload,
            isTeamUpdateInput,
            "Team update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteTeam(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "users",
    "User commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listUsers({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getUser(id),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateUser(
          id,
          ensurePayload(
            payload,
            isUserUpdateInput,
            "User update payload must be a non-empty object.",
          ),
        ),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "labels",
    "Issue label commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listLabels({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getLabel(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createLabel(
          ensurePayload(payload, isLabelCreateInput, "Label create payload requires name."),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateLabel(
          id,
          ensurePayload(
            payload,
            isLabelUpdateInput,
            "Label update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteLabel(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "comments",
    "Comment commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listComments({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createComment(
          ensurePayload(payload, isCommentCreateInput, "Comment create payload requires body."),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateComment(
          id,
          ensurePayload(
            payload,
            isCommentUpdateInput,
            "Comment update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteComment(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "attachments",
    "Attachment commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listAttachments({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getAttachment(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createAttachment(
          ensurePayload(
            payload,
            isAttachmentCreateInput,
            "Attachment create payload requires title and url.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteAttachment(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "states",
    "Workflow state commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listWorkflowStates({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getWorkflowState(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createWorkflowState(
          ensurePayload(
            payload,
            isWorkflowStateCreateInput,
            "Workflow state create payload requires name and teamId.",
          ),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateWorkflowState(
          id,
          ensurePayload(
            payload,
            isWorkflowStateUpdateInput,
            "Workflow state update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteWorkflowState(id),
    },
    authManager,
  );

  program
    .command("tui")
    .description("Open interactive terminal UI")
    .option("--screen <name>", "issues | boards | cycles", "issues")
    .action(async (opts, cmd) => {
      const globals = getGlobalOptions(cmd);
      const session = await authManager.openSession({ profile: globals.profile });
      await runLinearTui({
        gateway: session.gateway,
        initialScreen:
          opts.screen === "boards" || opts.screen === "cycles" ? opts.screen : "issues",
      });
    });

  return program;
}
