import type { ErrorEnvelope, OutputEnvelope } from "@wiseiodev/linear-core";
import type { GlobalOptions } from "../runtime/options.js";

function printHumanData(data: unknown): void {
  if (Array.isArray(data)) {
    console.table(data);
    return;
  }

  if (data !== null && typeof data === "object") {
    console.table([data]);
    return;
  }

  console.log(String(data));
}

export function renderEnvelope<Data>(envelope: OutputEnvelope<Data>, options: GlobalOptions): void {
  if (options.json) {
    console.log(JSON.stringify(envelope, null, 2));
    return;
  }

  if (envelope.ok) {
    if (!options.quiet) {
      console.log(`${envelope.entity}.${envelope.action}`);
    }
    printHumanData(envelope.data);
    return;
  }

  const error = envelope as ErrorEnvelope;
  console.error(`${error.entity}.${error.action} failed: ${error.error.message}`);
  if (error.error.details) {
    console.error(JSON.stringify(error.error.details, null, 2));
  }
}
