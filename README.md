# Linear Agent CLI

Agent-first Linear CLI + TUI built with TypeScript, pnpm, Turborepo, the Linear SDK, Biome, and Vitest.

## Tooling

- Node: `22` (see `.nvmrc`)
- Package manager: `pnpm@10.32.1`
- Monorepo runner: Turborepo

## Packages

- `@linear-agent/linear-core`: auth, config, token storage, SDK gateway, output envelope
- `@linear-agent/skills-catalog`: bundled skill registry + Vercel Skills CLI installer wrapper
- `@linear-agent/tui`: Ink React terminal UI for issues, boards, cycles
- `@linear-agent/cli`: `linear` and `li` command binaries

## Install

```bash
pnpm install
```

## Verify

```bash
pnpm verify
```

## Run CLI

```bash
pnpm --filter @linear-agent/cli dev -- --help
pnpm --filter @linear-agent/cli dev -- issues list --json
```

## Example Commands

```bash
# Auth
linear auth api-key-set --api-key "$LINEAR_API_KEY"
linear auth status --json

# Docs bookmark
linear docs
linear docs --open

# Skills
linear skills list
linear skills install issue-triage

# CRUD
linear issues list --limit 10
linear issues create --input '{"title":"Investigate bug","teamId":"<team-id>"}'
linear projects list

# TUI
linear tui --screen issues
linear tui --screen boards
linear tui --screen cycles
```

## Skills In Repo

Downloadable skills are included at:

- `assets/skills/issue-triage/SKILL.md`
- `assets/skills/cycle-planning/SKILL.md`

Installer wrapper command:

```bash
linear skills install <skill-name>
```

This runs:

```bash
npx skills add <org/repo/path> https://github.com/vercel-labs/skills
```

## Release Flows

### Prerelease (automatic on `main`)

- Workflow: `.github/workflows/release-prerelease.yml`
- Publishes alpha prereleases to npm using semantic-release
- Dist-tag/channel: `next`

### Production Release (manual)

- Workflow: `.github/workflows/release-production.yml`
- Triggered manually via GitHub Actions
- Publishes stable release to npm as `latest`

## Linear SDK Docs

- [SDK docs](https://linear.app/developers/sdk)
- [GraphQL docs](https://linear.app/developers/graphql)
- [SDK GraphQL schema](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)
