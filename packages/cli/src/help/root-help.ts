export const rootHelpText = `
Linear CLI v2

Task-first workflows:
  linear doctor
  linear my-work --mine
  linear triage --team ENG
  linear project status <project-id>
  linear updates --limit 20

Examples:
  linear auth login
  linear auth login --manual
  linear auth status --json
  linear auth api-key-set --api-key "$LINEAR_API_KEY"
  linear doctor
  linear my-work --limit 10
  linear triage --team ENG --view detail
  linear issues --help
  linear issues branch --help
  linear issues list --limit 10 --state "In Progress" --assignee me
  linear issues branch ANN-123 --json
  linear issues browse
  linear issues create --template "Bug Report" --input '{"teamId":"<team-id>"}'
  linear customers list
  linear customer-needs list
  linear milestones list
  linear project-updates list
  linear initiative-updates list
  linear notifications list
  linear initiatives list
  linear documents list
  linear templates list
  linear skills install issue-triage
  linear docs --open

Output:
  - Human-readable tables by default
  - Detail views with --view detail
  - Field selection with --fields identifier,title,assigneeName
  - Strict machine output with --json

Docs:
  - SDK: https://linear.app/developers/sdk
  - OAuth: https://linear.app/developers/oauth-2-0-authentication
`;

export const issuesHelpText = `
Examples:
  linear issues --help
  linear issues list --limit 10 --json
  linear issues list --mine --state "Todo" --view detail
  linear issues list --fields identifier,title,assigneeName,projectName
  linear issues create --template "Bug Report" --input '{"teamId":"<team-id>"}' --json
`;

export const issueBranchHelpText = `
Examples:
  linear issues branch ANN-123
  linear issues branch ANN-123 --json

JSON path:
  .data.branchName
`;
