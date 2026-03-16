import { createHash, randomBytes } from "node:crypto";

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export interface PkcePair {
  readonly verifier: string;
  readonly challenge: string;
}

export function createPkcePair(): PkcePair {
  const verifier = base64UrlEncode(randomBytes(64));
  const challenge = base64UrlEncode(createHash("sha256").update(verifier).digest());

  return {
    verifier,
    challenge,
  };
}
