# Agent Instructions

- Do not run git mutations (`git add`, `git commit`, `git push`) unless the user explicitly asks.
- All quality checks must pass before any push. Run `pnpm verify` and do not push if it fails.
