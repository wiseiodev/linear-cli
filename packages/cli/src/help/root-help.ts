export const rootHelpText = `
Agent-first Linear CLI

Examples:
  linear auth login
  linear auth login --manual
  linear auth status --json
  linear auth api-key-set --api-key "$LINEAR_API_KEY"
  linear issues --help
  linear issues branch --help
  linear issues list --limit 10
  linear issues branch ANN-123 --json
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

export const issuesHelpText = `
Examples:
  linear issues --help
  linear issues list --limit 10 --json
  linear issues create --template "Bug Report" --input '{"teamId":"<team-id>"}' --json
`;

export const issueBranchHelpText = `
Examples:
  linear issues branch ANN-123
  linear issues branch ANN-123 --json

JSON path:
  .data.branchName
`;
