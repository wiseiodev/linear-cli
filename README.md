# Linear Agent CLI

Agent-first Linear CLI + TUI built with TypeScript, pnpm, Turborepo, the Linear SDK, Biome, and Vitest.

## Tooling

- Node: `22` (see `.nvmrc`)
- Package manager: `pnpm@10.32.1`
- Monorepo runner: Turborepo

## Packages

- `@wiseiodev/linear-core`: auth, config, token storage, SDK gateway, output envelope
- `@wiseiodev/skills-catalog`: bundled skill registry + Vercel Skills CLI installer wrapper
- `@wiseiodev/tui`: Ink React terminal UI for issues, projects, initiatives, cycles
- `@wiseiodev/linear-cli`: `linear` and `li` command binaries

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
pnpm --filter @wiseiodev/linear-cli dev --help
pnpm --filter @wiseiodev/linear-cli dev issues list --json
```

## Help Discovery

```bash
linear --help
linear issues --help
linear issues branch --help
linear issues branch ANN-123 --json
# branch name is in .data.branchName
```

## Example Commands

```bash
# Auth
linear auth login
linear auth login --manual
linear auth status --json
linear auth api-key-set --api-key "$LINEAR_API_KEY"

# Docs bookmark
linear docs
linear docs --open

# Skills
linear skills list
linear skills install issue-triage

# CRUD
linear issues list --limit 10
linear issues branch ANN-123 --json
linear issues browse
linear issues create --input '{"title":"Investigate bug","teamId":"<team-id>"}'
linear projects list
linear documents list

# TUI
linear tui --screen issues
linear tui --screen projects
linear tui --screen initiatives
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
- [OAuth docs](https://linear.app/developers/oauth-2-0-authentication)
- [SDK GraphQL schema](https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql)
