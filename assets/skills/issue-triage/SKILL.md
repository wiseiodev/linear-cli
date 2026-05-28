---
name: issue-triage
description: Agent playbook for Linear issue triage and prioritization
---

When invoked, review issue details, assign priority, suggest owner, and propose next action.

Checklist:
1. Confirm issue scope and acceptance criteria.
2. Validate priority against impact and urgency.
3. Suggest assignee and timeline.
4. Propose labels, cycle placement, and dependencies.
5. Apply the triage decision in one call. Set state by name (no stateId lookup needed); the name resolves against the issue's team:

   ```bash
   linear issues update <id> --state "Todo" --input '{"priority":2}' --json
   ```

   An unknown state name lists the team's valid states. Discover names with `linear states list --json`.
