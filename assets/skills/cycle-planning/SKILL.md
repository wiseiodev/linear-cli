---
name: cycle-planning
description: Plan cycle scope and identify risks using Linear entities
---

When invoked, assemble cycle plan from candidate issues.

Checklist:
1. Fetch active team and cycle constraints.
2. Group candidate issues by objective.
3. Flag blocked work and missing dependencies.
4. Produce a recommended cycle scope with rationale.
5. When committing the plan, move issues by state name (no stateId lookup needed); the name resolves against each issue's team. Use bulk-update when changing more than one issue:

   ```bash
   linear issues update <id> --state "Todo" --json
   linear issues bulk-update --ids ENG-123,ENG-124 --state "Todo" --dry-run --json
   ```

   An unknown state name lists the team's valid states. Discover names with `linear states list --json`.
