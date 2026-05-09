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
linear issues list --json
linear issues get <id-or-identifier> --json
linear issues create --input '{"teamId":"<team-id>","title":"Investigate issue"}' --json
linear issues update <id-or-identifier> --input '{"priority":2}' --json
linear issues branch <id-or-identifier> --json
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
linear issues list --no-parent --json
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

## Batch Workflows

Use `bulk-update` for multi-issue updates. Start with `--dry-run` and inspect the per-issue result before writing:

```bash
linear issues bulk-update --ids ENG-123,ENG-124 --input '{"priority":2}' --dry-run --json
linear issues bulk-update --ids ENG-123,ENG-124 --input '{"priority":2}' --json
linear issues bulk-update --input-file updates.json --dry-run --json
```

For per-issue input files, use an array where each object includes the target issue id or identifier plus update fields.

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
