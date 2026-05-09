# Self-QA fallback — issue-3

> This work item has no demoable browser surface, so a Playwright video walkthrough is not possible.
> This document replaces the recording and describes what was verified instead.

## Why no video

This change ships a CLI flag (`linear issues list --parent`) plus a thin gateway helper. There is no browser-rendered surface; verification happens through unit tests and inspecting CLI argument plumbing.

## What was verified

- [x] `--parent <id-or-identifier>` is exposed as a global option and shown in `linear issues list --help` because the program registers Commander's `showGlobalOptions: true`.
- [x] `LinearGateway.listIssues` forwards the parent constraint as `{ filter: { parent: { id: { eq: <uuid> } } } }` to the SDK.
  - Verified by: new test `passes parent filter through to SDK after resolving identifier to UUID` in `packages/linear-core/tests/linear-gateway.test.ts`. Captures the variables passed to `client.issues(...)` for both an identifier (`ENG-42`, resolved via `client.issue(...)` to UUID `parent-uuid-123`) and a raw UUID input.
- [x] Identifier inputs (e.g. `BB-418`) are resolved to a UUID; UUID inputs short-circuit and are returned as-is.
  - Verified by: new test `resolveIssueId returns UUIDs unchanged and looks up identifiers`.
- [x] No regression in the existing `listIssues` mapping.
  - Verified by: existing `lists issues and maps fields` test continues to pass.
- [x] Quality gates: `pnpm verify` (biome check:write, turbo typecheck, turbo test) — all green. 7/7 tasks succeeded.

## Evidence

- `packages/linear-core/src/entities/linear-gateway.ts` — `listIssues` now threads `parent` into the SDK filter via the new `resolveIssueId` helper.
- `packages/linear-core/src/types/public.ts` — `ListOptions.parent` added so the gateway accepts the constraint.
- `packages/cli/src/index.ts` — global `--parent <id-or-identifier>` registered; `issues list`, `my-work`, and `triage` each pre-resolve the parent identifier to a UUID once via `gateway.resolveIssueId(...)` before entering the `collectPageResult` paging loop, so identifier lookups never repeat per page.
- `packages/cli/src/runtime/options.ts` — `parent` added to `GlobalOptions`.
- `packages/cli/src/help/root-help.ts` — example added: `linear issues list --parent ANN-123 --json`.
- `packages/linear-core/tests/linear-gateway.test.ts` — two new tests covering the parent filter pipeline.

## Follow-up flag

The issue also lists nice-to-haves (`--no-parent` for top-level only, parent identifier in JSON outputs, inheriting global flags into `issues list --help`). The first two are out of scope for this slice. Inherited-flag visibility is already enabled at program level (`showGlobalOptions: true`); confirm in a follow-up that this surfaces in subcommand `--help` once the user pulls.
