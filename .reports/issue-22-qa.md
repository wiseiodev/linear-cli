# Self-QA fallback — issue #22

> This work item has no demoable browser surface, so a Playwright video walkthrough is not possible.
> This document replaces the recording and describes what was verified instead.

## Why no video

`linear-cli` is a terminal CLI / SDK monorepo with no web UI. The change is a deep
workflow-state resolver in `@wiseiodev/linear-core` plus input normalization wired into
the `linear issues update` command. The acceptance criteria are pure input/output
behavior, verified deterministically through unit tests (fake gateways), a runtime
demonstration against the built module, and a CLI help smoke test.

## What was verified

Acceptance criteria from issue #22:

- [x] `issues update <id> --state "<name>"` sets the issue to the matching state
  - The generic resource registrar now allows the issues `update` command to run with no
    `--input` (opt-in `allowEmptyInput`), and the handler folds `--state` into a resolved
    `stateId`.
  - Verified by: `tests/issue-state.test.ts` → "resolves the --state flag to a stateId
    scoped to the issue's team"; CLI help smoke test shows `--state <name>` available on
    `linear issues update`.

- [x] `--input '{"stateName":"<name>"}'` and `--input '{"state":"<name>"}'` resolve to a `stateId`
  - Verified by: `tests/issue-state.test.ts` → "resolves a `state` key…" and "resolves a
    `stateName` key…" (both assert the resolved `stateId` and that the name key is stripped).

- [x] `--input '{"stateId":"<uuid>"}'` continues to work unchanged
  - Verified by: `tests/issue-state.test.ts` → "leaves an explicit stateId untouched, skips
    resolution, strips name keys" (no `getIssue` call; `stateId` passed through verbatim).

- [x] Resolution is scoped to the target issue's team
  - The handler fetches the issue, reads `teamId`, and lists states via
    `listWorkflowStatesForTeam(teamId)` (server-side `filter: { team: { id: { eq } } }`).
  - Verified by: `tests/issue-state.test.ts` asserts `getIssue("ANN-1")` and
    `listWorkflowStatesForTeam("team-1")`; `tests/state-resolver.test.ts` → "scopes the
    lookup to the provided team id".

- [x] Unknown/ambiguous name errors with the team's valid state names listed
  - Verified by: `tests/state-resolver.test.ts` → "throws a LinearCoreError listing valid
    states when the name is unknown" and "throws an ambiguity error…"; runtime demo below
    shows the exact messages.

- [x] `state`/`stateName` keys never reach GraphQL
  - The normalizer destructures `state`/`stateName` out of the payload before returning.
  - Verified by: every resolving test asserts the output contains only `stateId` (+ other
    real fields), never `state`/`stateName`.

- [x] Resolver unit tests cover UUID passthrough, name match, type fallback, not-found, ambiguous
  - `tests/state-resolver.test.ts` — 7 tests, all passing (see Evidence).

- [x] `issues update` normalization is tested (flag + JSON-key paths, stateId untouched)
  - `tests/issue-state.test.ts` — 8 tests, all passing (see Evidence).

## Evidence

Quality gates (all green):

- `pnpm verify` → biome check (0 errors), `turbo run typecheck` (4 pkgs), `turbo run test`
  (linear-core 58 tests, cli 60 tests — totals include the 8 + 10 new tests).
- `pnpm build` → 4 packages built successfully.

Focused test runs:

```
tests/state-resolver.test.ts (8 passed)
 ✓ returns a UUID reference unchanged without listing states
 ✓ matches an exact state name case-insensitively
 ✓ scopes the lookup to the provided team id
 ✓ falls back to the lowest-position state of the preferred type
 ✓ preferred-type fallback ignores states without a position
 ✓ throws a LinearCoreError listing valid states when the name is unknown
 ✓ throws when no name match and the preferred type is absent
 ✓ throws an ambiguity error when multiple states share the name

tests/issue-state.test.ts (10 passed)
 ✓ resolves the --state flag to a stateId scoped to the issue's team
 ✓ resolves a `state` key in the payload and strips it
 ✓ resolves a `stateName` key in the payload and strips it
 ✓ leaves an explicit stateId untouched, skips resolution, strips name keys
 ✓ resolves a state ref even when stateId is present but empty
 ✓ trims a whitespace-padded UUID --state and skips the fetch
 ✓ prefers the --state flag over `state`/`stateName` keys
 ✓ returns the payload unchanged and skips the fetch when no state is provided
 ✓ passes a UUID --state through without fetching the issue
 ✓ surfaces a listing error when the state name is unknown
```

Runtime demonstration against the built `@wiseiodev/linear-core` module:

```
1. UUID passthrough (no team lookup):
   resolve(11111111-2222-3333-4444-555555555555) => 11111111-2222-3333-4444-555555555555 | list calls: 0
2. Case-insensitive name match:
   resolve('in progress') => s-progress
3. Preferred-type fallback (lowest position 'started'):
   resolve('Doing', {preferredType:'started'}) => s-progress
4. Unknown name -> typed error listing valid states:
   code: InvalidInput | message: Workflow state "Nope" not found for this team. Valid states: Backlog (backlog), Todo (unstarted), In Progress (started), In Review (started), Done (completed).
5. Ambiguous name -> typed error:
   code: InvalidInput | message: Workflow state "In Progress" is ambiguous for this team. Valid states: In Progress (started), in progress (started).
6. isWorkflowStateId guard: true / false
```

CLI help smoke test (`node packages/cli/dist/bin/linear.js issues update --help`) confirms the
`update` command exists and exposes the `--state <name>` global option.

## Follow-up flag

End-to-end execution against the live Linear API (real auth + a real issue) was not run because
it requires network credentials and is non-deterministic. The deterministic unit/runtime
evidence above covers every acceptance criterion. Create/bulk-update state-by-name and the
`prep`/`pr-ready` consumers of the preferred-`type` fallback are intentionally out of scope
(tracked by issues #27, #28, #29).
