import { readFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import type {
  SdkAttachmentInput,
  SdkAttachmentUpdateInput,
  SdkCommentInput,
  SdkCommentUpdateInput,
  SdkCycleInput,
  SdkCycleUpdateInput,
  SdkDocumentInput,
  SdkDocumentUpdateInput,
  SdkInitiativeInput,
  SdkInitiativeUpdateInput,
  SdkIssueInput,
  SdkIssueLabelInput,
  SdkIssueLabelUpdateInput,
  SdkIssueUpdateInput,
  SdkProjectInput,
  SdkProjectUpdateInput,
  SdkTeamInput,
  SdkTeamUpdateInput,
  SdkTemplateInput,
  SdkTemplateUpdateInput,
  SdkUserUpdateInput,
  SdkWorkflowStateInput,
  SdkWorkflowStateUpdateInput,
} from "@wiseiodev/linear-core";
import {
  AuthManager,
  errorEnvelope,
  normalizeError,
  successEnvelope,
} from "@wiseiodev/linear-core";
import { getSkill, installSkill, listSkills } from "@wiseiodev/skills-catalog";
import { runLinearTui } from "@wiseiodev/tui";
import { Command } from "commander";
import open from "open";
import { runInteractiveOAuthLogin } from "./auth/login.js";
import { registerResourceCommand } from "./commands/resource.js";
import { renderEnvelope } from "./formatters/output.js";
import { rootHelpText } from "./help/root-help.js";
import { getGlobalOptions } from "./runtime/options.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function readCliVersion(): string {
  const indexDirectory = path.dirname(fileURLToPath(import.meta.url));
  const packageJsonCandidates = [
    path.resolve(indexDirectory, "../package.json"),
    path.resolve(indexDirectory, "../../package.json"),
  ];

  for (const packageJsonPath of packageJsonCandidates) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      if (isRecord(packageJson) && typeof packageJson.version === "string") {
        return packageJson.version;
      }
    } catch {}
  }

  return "0.0.0";
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
  return (
    isRecord(value) &&
    hasString(value, "teamId") &&
    (hasString(value, "title") || hasString(value, "templateId"))
  );
}

function isIssueUpdateInput(value: unknown): value is SdkIssueUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isInitiativeCreateInput(value: unknown): value is SdkInitiativeInput {
  return isRecord(value) && hasString(value, "name");
}

function isInitiativeUpdateInput(value: unknown): value is SdkInitiativeUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isProjectCreateInput(value: unknown): value is SdkProjectInput {
  return isRecord(value) && hasString(value, "name");
}

function isProjectUpdateInput(value: unknown): value is SdkProjectUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isDocumentCreateInput(value: unknown): value is SdkDocumentInput {
  return isRecord(value) && hasString(value, "title");
}

function isDocumentUpdateInput(value: unknown): value is SdkDocumentUpdateInput {
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

function isAttachmentUpdateInput(value: unknown): value is SdkAttachmentUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
}

function isTemplateCreateInput(value: unknown): value is SdkTemplateInput {
  return (
    isRecord(value) &&
    hasString(value, "name") &&
    hasString(value, "type") &&
    isRecord(value.templateData)
  );
}

function isTemplateUpdateInput(value: unknown): value is SdkTemplateUpdateInput {
  return isRecord(value) && Object.keys(value).length > 0;
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

async function resolveIssueTemplateId(
  gateway: Awaited<ReturnType<AuthManager["openSession"]>>["gateway"],
  reference: string,
): Promise<string> {
  const templates = await gateway.listTemplates();
  const exactIdMatch = templates.find((template) => template.id === reference);

  if (exactIdMatch) {
    return exactIdMatch.id;
  }

  const exactNameMatches = templates.filter((template) => template.name === reference);

  if (exactNameMatches.length === 1) {
    const [exactNameMatch] = exactNameMatches;
    if (exactNameMatch) {
      return exactNameMatch.id;
    }
  }

  if (exactNameMatches.length > 1) {
    throw new Error(`Template name "${reference}" is ambiguous. Use a template id instead.`);
  }

  throw new Error(`Template not found: ${reference}`);
}

export function createProgram(authManager = new AuthManager()): Command {
  const program = new Command();

  program
    .name("linear")
    .version(readCliVersion(), "-v, --version", "output the version number")
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
    .description("Store API key for profile as a fallback auth method")
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
    .description("Guided OAuth login for profile")
    .option("--manual", "Use manual copy/paste login flow")
    .option("--client-id <id>", "OAuth client id")
    .option("--redirect-uri <uri>", "OAuth redirect URI")
    .option("--scopes <list>", "Comma separated scopes override")
    .action(async (opts, cmd) => {
      const globals = getGlobalOptions(cmd);
      const profile = globals.profile ?? "default";

      try {
        const result = await runInteractiveOAuthLogin({
          profile,
          manual: opts.manual === true,
          clientId: typeof opts.clientId === "string" ? opts.clientId : undefined,
          redirectUri: typeof opts.redirectUri === "string" ? opts.redirectUri : undefined,
          scopes: typeof opts.scopes === "string" ? opts.scopes : undefined,
          authManager,
          prompt: readSecret,
          openBrowser: async (target) => {
            await open(target);
          },
        });

        renderEnvelope(successEnvelope("auth", "login", result), globals);
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
      try {
        const status = await authManager.status(globals.profile);
        renderEnvelope(successEnvelope("auth", "status", status), globals);
      } catch (error) {
        const normalized = normalizeError(error);
        renderEnvelope(
          errorEnvelope("auth", "status", {
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
    .command("logout")
    .description("Clear credentials for profile but keep saved OAuth app config")
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
        oauth: "https://linear.app/developers/oauth-2-0-authentication",
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
      create: async (_manager, payload, cmd) => {
        const templateReference = cmd.opts<{ template?: string }>().template;
        const payloadWithTemplateReference =
          templateReference && isRecord(payload)
            ? {
                ...payload,
                templateId: templateReference,
              }
            : payload;
        const issueInput = ensurePayload(
          payloadWithTemplateReference,
          isIssueCreateInput,
          "Issue create payload requires teamId plus title or templateId.",
        );

        if (!templateReference) {
          return (await sessionGateway(cmd)).createIssue(issueInput);
        }

        const gateway = await sessionGateway(cmd);
        const templateId = await resolveIssueTemplateId(gateway, templateReference);
        return gateway.createIssue({
          ...issueInput,
          templateId,
        });
      },
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

  const issuesCommand = program.commands.find((command) => command.name() === "issues");
  issuesCommand?.commands
    .find((command) => command.name() === "create")
    ?.option("--template <id-or-name>", "Apply a template by exact id or exact name");

  issuesCommand
    ?.command("branch")
    .description("Show branch name for an issue id or identifier")
    .argument("<id-or-identifier>", "Issue id (UUID) or identifier (e.g. ANN-123)")
    .action(async (idOrIdentifier, _, cmd) => {
      const globals = getGlobalOptions(cmd);

      try {
        const data = await (await sessionGateway(cmd)).getIssueBranchName(idOrIdentifier);
        renderEnvelope(successEnvelope("issues", "show", data), globals);
      } catch (error) {
        const normalized = normalizeError(error);
        renderEnvelope(
          errorEnvelope("issues", "show", {
            code: normalized.code,
            message: normalized.message,
            details: normalized.details,
          }),
          globals,
        );
        process.exitCode = 1;
      }
    });

  issuesCommand
    ?.command("browse")
    .description("Browse issues in the interactive terminal table")
    .action(async (_, cmd) => {
      const globals = getGlobalOptions(cmd);

      if (globals.json) {
        renderEnvelope(
          errorEnvelope("issues", "browse", {
            code: "UNSUPPORTED_OPERATION",
            message: "issues browse does not support --json output",
          }),
          globals,
        );
        process.exitCode = 1;
        return;
      }

      try {
        const session = await authManager.openSession({ profile: globals.profile });
        await runLinearTui({
          gateway: session.gateway,
          defaultScreen: "issues",
          openUrl: async (target) => {
            await open(target);
          },
        });
      } catch (error) {
        const normalized = normalizeError(error);
        renderEnvelope(
          errorEnvelope("issues", "browse", {
            code: normalized.code,
            message: normalized.message,
            details: normalized.details,
          }),
          globals,
        );
        process.exitCode = 1;
      }
    });

  registerResourceCommand(
    program,
    "initiatives",
    "Initiative commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listInitiatives({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getInitiative(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createInitiative(
          ensurePayload(
            payload,
            isInitiativeCreateInput,
            "Initiative create payload requires name.",
          ),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateInitiative(
          id,
          ensurePayload(
            payload,
            isInitiativeUpdateInput,
            "Initiative update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteInitiative(id),
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
    "documents",
    "Document commands",
    {
      list: async (_manager, cmd) => {
        const globals = getGlobalOptions(cmd);
        return (await sessionGateway(cmd)).listDocuments({
          limit: globals.limit,
          cursor: globals.cursor,
        });
      },
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getDocument(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createDocument(
          ensurePayload(payload, isDocumentCreateInput, "Document create payload requires title."),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateDocument(
          id,
          ensurePayload(
            payload,
            isDocumentUpdateInput,
            "Document update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteDocument(id),
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
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getComment(id),
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
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateAttachment(
          id,
          ensurePayload(
            payload,
            isAttachmentUpdateInput,
            "Attachment update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteAttachment(id),
    },
    authManager,
  );

  registerResourceCommand(
    program,
    "templates",
    "Template commands",
    {
      list: async (_manager, cmd) => (await sessionGateway(cmd)).listTemplates(),
      get: async (_manager, id, cmd) => (await sessionGateway(cmd)).getTemplate(id),
      create: async (_manager, payload, cmd) =>
        (await sessionGateway(cmd)).createTemplate(
          ensurePayload(
            payload,
            isTemplateCreateInput,
            "Template create payload requires name, type, and templateData.",
          ),
        ),
      update: async (_manager, id, payload, cmd) =>
        (await sessionGateway(cmd)).updateTemplate(
          id,
          ensurePayload(
            payload,
            isTemplateUpdateInput,
            "Template update payload must be a non-empty object.",
          ),
        ),
      delete: async (_manager, id, cmd) => (await sessionGateway(cmd)).deleteTemplate(id),
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
    .option("--screen <name>", "issues | projects | initiatives | documents | cycles", "issues")
    .action(async (opts, cmd) => {
      const globals = getGlobalOptions(cmd);
      try {
        const session = await authManager.openSession({ profile: globals.profile });
        const defaultScreen =
          opts.screen === "projects" ||
          opts.screen === "initiatives" ||
          opts.screen === "documents" ||
          opts.screen === "cycles"
            ? opts.screen
            : "issues";
        await runLinearTui({
          gateway: session.gateway,
          defaultScreen,
          openUrl: async (target) => {
            await open(target);
          },
        });
      } catch (error) {
        const normalized = normalizeError(error);
        const message =
          normalized.code === "AUTH_REQUIRED"
            ? `${normalized.message} Run linear auth login.`
            : normalized.message;
        renderEnvelope(
          errorEnvelope("tui", "open", {
            code: normalized.code,
            message,
            details: normalized.details,
          }),
          globals,
        );
        process.exitCode = 1;
      }
    });

  return program;
}
