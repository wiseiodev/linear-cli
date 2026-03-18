export const rootHelpText = `
Agent-first Linear CLI

Examples:
  linear auth login
  linear auth login --manual
  linear auth status --json
  linear auth api-key-set --api-key "$LINEAR_API_KEY"
  linear issues list --limit 10
  linear issues browse
  linear issues create --template "Bug Report" --input '{"teamId":"<team-id>"}'
  linear initiatives list
  linear documents list
  linear templates list
  linear skills install issue-triage
  linear docs --open

Output:
  - Human-readable tables by default
  - Strict machine output with --json

Docs:
  - SDK: https://linear.app/developers/sdk
  - OAuth: https://linear.app/developers/oauth-2-0-authentication
`;
