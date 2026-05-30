---
name: linear-cli
description: Use the Linear CLI for agent-friendly Linear issue workflows
---

# Linear CLI

Use this skill when you need to inspect, create, update, or organize Linear issues from an agent session.

## Core Rules

- Prefer `linear` commands for Linear work. The short alias `li` is equivalent when available.
- Use `--json` whenever another tool, script, or agent will consume the output.
- Check auth and workspace context before making changes:

```bash
linear auth status --json
```

- Prefer canonical branch names from Linear instead of hand-crafting branch names:

```bash
linear issues branch <id-or-identifier> --json
```

Read the branch from `.data.branchName`.

## Common Issue Commands

```bash
linear issues list --limit 25 --json
linear issues get <id-or-identifier> --json
linear issues create --input '{"teamId":"<team-id>","title":"Investigate issue"}' --json
linear issues update <id-or-identifier> --input '{"priority":2}' --json
linear issues branch <id-or-identifier> --json
linear comments list --issue <id-or-identifier> --json
linear prep <id-or-identifier> --json
linear pr-ready <id-or-identifier> --pr <url> --json
```

For list workflows, use filters instead of broad scans when possible:

```bash
linear issues list --team ENG --state "In Progress" --json
linear issues list --assignee me --json
linear issues list --project "Project name" --label eng --json
linear issues list --query "search text" --json
linear issues list --updated-after 2026-05-01 --json
linear issues list --created-after -P7D --json
linear issues list --parent ENG-123 --json
linear issues list --team ENG --no-parent --json
```

Use pagination flags for bounded queries:

```bash
linear issues list --limit 50 --cursor <cursor> --json
```

Use `--all` only when the workflow needs a full local drain before filtering or sorting.

## Create And Update Payloads

Issue creation requires `teamId` plus either `title` or a template:

```bash
linear issues create --input '{"teamId":"<team-id>","title":"New issue title"}' --json
linear issues create --state "Todo" --input '{"teamId":"<team-id>","title":"New issue title"}' --json
linear issues create --input '{"teamId":"<team-id>","title":"New issue title","state":"Todo"}' --json
linear issues create --template "Bug Report" --input '{"teamId":"<team-id>"}' --json
```

Issue updates accept Linear issue update fields:

```bash
linear issues update ENG-123 --input '{"title":"Clearer title","priority":2}' --json
linear issues update ENG-123 --input-file update.json --json
```

For exact payload fields, check command help and the Linear GraphQL schema references shown there:

```bash
linear issues create --help
linear issues update --help
linear docs
```

## Set Issue State By Name

You do not need a `stateId` UUID to change an issue's state. Pass the state name and the CLI resolves it against the target issue's team:

```bash
linear issues update ENG-123 --state "In Progress" --json
linear issues update ENG-123 --input '{"state":"In Progress"}' --json
linear issues update ENG-123 --input '{"stateName":"In Progress"}' --json
linear issues create --state "Todo" --input '{"teamId":"<team-id>","title":"New issue"}' --json
linear issues bulk-update --ids ENG-123,ENG-124 --state "In Progress" --dry-run --json
```

All three are equivalent. A raw `stateId` UUID still works and is used as-is:

```bash
linear issues update ENG-123 --input '{"stateId":"<uuid>"}' --json
```

Notes:

- Resolution is scoped to the issue's own team, so the same name (e.g. "In Progress") maps to the right team's state.
- The match is case-insensitive and ignores surrounding whitespace.
- An unknown or ambiguous name fails with an error that lists the team's valid states as `name (type)`, so you can correct it in one step instead of guessing.
- To discover the exact names yourself, list the workflow states:

```bash
linear states list --json
```

## Common Mistakes

These are the patterns agents reach for that do not work, with the command that does:

| Goal | Do not use | Use instead |
| --- | --- | --- |
| Set an issue's state | Hand-crafting or guessing a `stateId` UUID | `linear issues update <id> --state "In Progress"` (or `--input '{"state":"In Progress"}'`; the name resolves automatically) |
| Discover workflow states | Guessing `list-states` or parsing team payloads | `linear states list --json` (`statuses` and `workflow-states` are accepted aliases) |
| Read one issue | Treating an alias as the canonical docs target | `linear issues get <id> --json` (`view` and `show` also work) |
| Read issue discussion | `linear comments list` with a broad scan | `linear comments list --issue <id-or-identifier> --json` |
| List issues | `linear issues list --all --json` with no filters | Add `--mine`, `--team`, `--state`, `--query`, or `--limit` |
| Start work | Multiple commands to fetch context, branch, and set state | `linear prep <id> --json` |
| Mark PR ready | Separate update plus hand-written PR comment | `linear pr-ready <id> --pr <url> --json` |

## Batch Workflows

Use `bulk-update` for multi-issue updates. Start with `--dry-run` and inspect the per-issue result before writing:

```bash
linear issues bulk-update --ids ENG-123,ENG-124 --input '{"priority":2}' --dry-run --json
linear issues bulk-update --ids ENG-123,ENG-124 --input '{"priority":2}' --json
linear issues bulk-update --ids ENG-123,ENG-124 --state "In Progress" --dry-run --json
linear issues bulk-update --input-file updates.json --dry-run --json
```

For per-issue input files, use an array where each object includes the target issue id or identifier plus update fields. A shared `--state` applies to every item and resolves per issue team; per-item `state` or `stateName` also works.

## Prep And PR Ready

Use `prep` when starting work. It fetches the issue, parent or project context, branch name, and moves the issue to the team's in-progress state:

```bash
linear prep ENG-123 --json
linear prep ENG-123 --state "Doing" --json
```

Use `pr-ready` when the branch is ready for review. It moves the issue to `In Review` unless you override the state, and comments only when you ask for one:

```bash
linear pr-ready ENG-123 --json
linear pr-ready ENG-123 --pr https://github.com/org/repo/pull/123 --json
linear pr-ready ENG-123 --comment "Ready for review" --json
```

## Linear Linking In GitHub

Link PRs and commits to Linear issues by including the Linear issue ID, such as `ENG-123`, in the branch name, PR title, PR description, or commit message.

### Branch Name

Prefer the CLI-generated branch name:

```bash
linear issues branch ENG-123 --json
```

Use `.data.branchName` as the branch name. If working from Linear directly, use the Copy git branch name action or Cmd/Ctrl + Shift while viewing or selecting an issue, then paste that value into the new GitHub branch name.

### Pull Request Title

Include the Linear issue ID in the PR title:

```text
ENG-123 Add richer Linear issue filtering
```

### Pull Request Description Or Title Magic Words

Use a magic word plus a Linear issue ID or Linear issue URL in the PR description or title:

```text
Fixes ENG-123
Fixes https://linear.app/workspace/issue/ENG-123/add-richer-filtering
```

If the Linear issue is unassigned when the link is created, Linear may assign it to the user who linked it.

Magic words must be in the PR title or description. They do not work when added only in a PR comment.

### Closing Magic Words

Closing magic words link the PR or commit and allow Linear automation to move the issue through the configured workflow, including moving it to Done when the PR or commit reaches the default branch.

Recognized closing magic words:

- `close`
- `closes`
- `closed`
- `closing`
- `fix`
- `fixes`
- `fixed`
- `fixing`
- `resolve`
- `resolves`
- `resolved`
- `resolving`
- `complete`
- `completes`
- `completed`
- `completing`
- `implements`
- `implemented`
- `implementing`

### Non-Closing Magic Words

Non-closing magic words link the PR or commit without automating the final Done transition on merge. Linear can still move the issue through earlier workflow statuses according to the workspace Workflow settings.

Recognized non-closing magic words:

- `ref`
- `refs`
- `references`
- `part of`
- `related to`
- `contributes to`
- `toward`
- `towards`

### Commit Messages

Use a magic word before the Linear issue ID in the commit message:

```text
Fixes ENG-123
```

Closing magic words can move the issue to In Progress when the commit is pushed and Done when the commit reaches the default branch, depending on Linear Workflow settings.

### Multiple Links

To link multiple Linear issues to one PR, include multiple issue IDs after the magic word in the PR description:

```text
Fixes ENG-123, DES-5 and ENG-256
```

To link multiple PRs to one Linear issue, use any linking technique on each PR. Linear updates the issue status when the final linked PR reaches the required workflow state; for example, if two PRs are linked to one Linear issue, both PRs generally need to merge before Linear moves the issue to Done.

## Safe Operating Checklist

1. Run `linear auth status --json` and confirm the workspace/team context.
2. Fetch the target issue with `linear issues get <id> --json` before mutating it.
3. Use filtered `linear issues list` commands instead of workspace-wide scans.
4. Use `--dry-run` for batch updates.
5. Prefer `linear issues branch <id> --json` for branch names.
6. Keep JSON output in logs or handoffs when another agent must continue the work.
