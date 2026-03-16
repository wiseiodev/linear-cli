import type {
  AuthManager,
  LinearAction,
  LinearEntity,
  OutputEnvelope,
} from "@wiseiodev/linear-core";
import { errorEnvelope, normalizeError, successEnvelope } from "@wiseiodev/linear-core";
import type { Command } from "commander";
import { renderEnvelope } from "../formatters/output.js";
import { getGlobalOptions } from "../runtime/options.js";
import { parseJsonInput } from "./input.js";

interface ResourceHandlers {
  readonly list?: (manager: AuthManager, command: Command) => Promise<unknown>;
  readonly get?: (manager: AuthManager, id: string, command: Command) => Promise<unknown>;
  readonly create?: (manager: AuthManager, payload: unknown, command: Command) => Promise<unknown>;
  readonly update?: (
    manager: AuthManager,
    id: string,
    payload: unknown,
    command: Command,
  ) => Promise<unknown>;
  readonly delete?: (manager: AuthManager, id: string, command: Command) => Promise<unknown>;
}

function toEnvelope(
  entity: LinearEntity,
  action: LinearAction,
  error: unknown,
): OutputEnvelope<unknown> {
  const normalized = normalizeError(error);
  return errorEnvelope(entity, action, {
    code: normalized.code,
    message: normalized.message,
    details: normalized.details,
  });
}

async function executeAction(
  entity: LinearEntity,
  action: LinearAction,
  command: Command,
  runner: () => Promise<unknown>,
): Promise<void> {
  const options = getGlobalOptions(command);

  try {
    const data = await runner();
    const envelope = successEnvelope(entity, action, data);
    renderEnvelope(envelope, options);
  } catch (error) {
    const envelope = toEnvelope(entity, action, error);
    renderEnvelope(envelope, options);
    process.exitCode = 1;
  }
}

export function registerResourceCommand(
  program: Command,
  entity: LinearEntity,
  description: string,
  handlers: ResourceHandlers,
  authManager: AuthManager,
): void {
  const command = program.command(entity).description(description);

  if (handlers.list) {
    const listHandler = handlers.list;
    command
      .command("list")
      .description(`List ${entity}`)
      .action(async (_, cmd) =>
        executeAction(entity, "list", cmd, () => listHandler(authManager, cmd)),
      );
  }

  if (handlers.get) {
    const getHandler = handlers.get;
    command
      .command("get")
      .description(`Get ${entity} by id`)
      .argument("<id>", "Entity id")
      .action(async (id, _, cmd) =>
        executeAction(entity, "get", cmd, () => getHandler(authManager, id, cmd)),
      );
  }

  if (handlers.create) {
    const createHandler = handlers.create;
    command
      .command("create")
      .description(`Create ${entity}`)
      .option("--input <json>", "Inline JSON payload")
      .option("--input-file <path>", "JSON payload file")
      .action(async (opts, cmd) =>
        executeAction(entity, "create", cmd, async () => {
          const payload = await parseJsonInput(opts);
          return createHandler(authManager, payload, cmd);
        }),
      );
  }

  if (handlers.update) {
    const updateHandler = handlers.update;
    command
      .command("update")
      .description(`Update ${entity}`)
      .argument("<id>", "Entity id")
      .option("--input <json>", "Inline JSON payload")
      .option("--input-file <path>", "JSON payload file")
      .action(async (id, opts, cmd) =>
        executeAction(entity, "update", cmd, async () => {
          const payload = await parseJsonInput(opts);
          return updateHandler(authManager, id, payload, cmd);
        }),
      );
  }

  if (handlers.delete) {
    const deleteHandler = handlers.delete;
    command
      .command("delete")
      .description(`Delete ${entity} by id`)
      .argument("<id>", "Entity id")
      .action(async (id, _, cmd) =>
        executeAction(entity, "delete", cmd, () => deleteHandler(authManager, id, cmd)),
      );
  }
}
