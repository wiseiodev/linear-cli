const SCHEMA_URL = "https://github.com/linear/linear/blob/master/packages/sdk/src/schema.graphql";

const FILTER_FLAG_DESCRIPTIONS: Record<FilterFlag, string> = {
  team: "--team <key>            Default team key",
  mine: "--mine                  Limit to items assigned to the authenticated user",
  project: "--project <id-or-name>  Project filter",
  cycle: "--cycle <id-or-name>    Cycle filter",
  state: "--state <name>          State or type filter",
  assignee: '--assignee <name>       Assignee filter (use "me" for the authenticated user)',
  label: "--label <name>          Label filter",
  priority: "--priority <value>      Priority filter",
  status: "--status <name>         Status or health filter",
  filter: "--filter <expr>         Lightweight filter expression, e.g. estimate>2",
  sort: "--sort <field>            Sort field, prefix with - for descending",
};

type FilterFlag =
  | "team"
  | "mine"
  | "project"
  | "cycle"
  | "state"
  | "assignee"
  | "label"
  | "priority"
  | "status"
  | "filter"
  | "sort";

type Pagination = "full" | "basic" | "none";

const PAGINATION_LINES: Record<Pagination, readonly string[]> = {
  full: [
    "--limit <n>             Page size",
    "--cursor <cursor>       Pagination cursor (returned in JSON envelope)",
    "--all                   Drain all pages before filtering",
  ],
  basic: [
    "--limit <n>             Page size",
    "--cursor <cursor>       Pagination cursor (returned in JSON envelope)",
  ],
  none: [],
};

const OUTPUT_LINES: readonly string[] = [
  "--view <preset>         Human output preset: table | detail | dense",
  "--fields <list>         Comma-separated field selection",
  "--json                  Strict machine output",
];

function inputDocsHint(entity: string): string {
  return `JSON input fields:
  See Linear's GraphQL schema for accepted fields:
    ${SCHEMA_URL}
  Search the schema for the relevant input type, e.g. ${graphqlInputTypeFor(entity)}.
  Run: linear docs --open`;
}

function graphqlInputTypeFor(entity: string): string {
  const map: Record<string, string> = {
    issues: "IssueCreateInput / IssueUpdateInput",
    customers: "CustomerCreateInput / CustomerUpdateInput",
    "customer-needs": "CustomerNeedCreateInput / CustomerNeedUpdateInput",
    initiatives: "InitiativeCreateInput / InitiativeUpdateInput",
    "initiative-updates": "InitiativeUpdateCreateInput / InitiativeUpdateUpdateInput",
    projects: "ProjectCreateInput / ProjectUpdateInput",
    milestones: "ProjectMilestoneCreateInput / ProjectMilestoneUpdateInput",
    "project-updates": "ProjectUpdateCreateInput / ProjectUpdateUpdateInput",
    documents: "DocumentCreateInput / DocumentUpdateInput",
    cycles: "CycleCreateInput / CycleUpdateInput",
    teams: "TeamCreateInput / TeamUpdateInput",
    users: "UserUpdateInput",
    labels: "IssueLabelCreateInput / IssueLabelUpdateInput",
    comments: "CommentCreateInput / CommentUpdateInput",
    attachments: "AttachmentCreateInput / AttachmentUpdateInput",
    templates: "TemplateCreateInput / TemplateUpdateInput",
    notifications: "NotificationUpdateInput",
    states: "WorkflowStateCreateInput / WorkflowStateUpdateInput",
  };
  return map[entity] ?? `${entity} input types`;
}

interface CreateHelp {
  readonly required: string;
  readonly examples: readonly string[];
}

interface UpdateHelp {
  readonly examples: readonly string[];
}

interface ListHelp {
  readonly filters: readonly FilterFlag[];
  readonly pagination: Pagination;
  readonly examples: readonly string[];
}

interface ResourceExamples {
  readonly resource?: readonly string[];
  readonly list?: ListHelp;
  readonly create?: CreateHelp;
  readonly update?: UpdateHelp;
}

const resourceExamples: Record<string, ResourceExamples> = {
  issues: {
    list: {
      filters: [
        "team",
        "mine",
        "project",
        "cycle",
        "state",
        "assignee",
        "label",
        "priority",
        "filter",
        "sort",
      ],
      pagination: "full",
      examples: [
        'linear issues list --limit 10 --state "In Progress" --assignee me',
        "linear issues list --mine --view detail --fields identifier,title,assigneeName",
        "linear issues list --all --json",
      ],
    },
    create: {
      required: "teamId plus (title or templateId)",
      examples: [
        'linear issues create --input \'{"teamId":"<team-id>","title":"My issue"}\'',
        'linear issues create --template "Bug Report" --input \'{"teamId":"<team-id>"}\' --json',
      ],
    },
    update: {
      examples: [
        "linear issues update <id> --input '{\"priority\":2}'",
        "linear issues update <id> --input-file payload.json --json",
      ],
    },
  },
  customers: {
    list: {
      filters: ["mine", "assignee", "status", "filter", "sort"],
      pagination: "full",
      examples: ["linear customers list --limit 25 --json", "linear customers list --view detail"],
    },
    create: {
      required: "name",
      examples: ['linear customers create --input \'{"name":"Acme Inc."}\''],
    },
    update: {
      examples: ['linear customers update <id> --input \'{"name":"Acme Holdings"}\''],
    },
  },
  "customer-needs": {
    list: {
      filters: ["project", "priority", "filter", "sort"],
      pagination: "full",
      examples: ["linear customer-needs list --limit 25 --json"],
    },
    create: {
      required: "any non-empty payload (e.g. customerId, body)",
      examples: [
        'linear customer-needs create --input \'{"customerId":"<id>","body":"Wants SSO"}\'',
      ],
    },
    update: {
      examples: ["linear customer-needs update <id> --input '{\"priority\":1}'"],
    },
  },
  initiatives: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear initiatives list --limit 25 --json"],
    },
    create: {
      required: "name",
      examples: ['linear initiatives create --input \'{"name":"Q3 platform"}\''],
    },
    update: {
      examples: ['linear initiatives update <id> --input \'{"description":"Updated"}\''],
    },
  },
  "initiative-updates": {
    list: {
      filters: ["filter", "sort"],
      pagination: "full",
      examples: ["linear initiative-updates list --limit 25 --json"],
    },
    create: {
      required: "body",
      examples: [
        'linear initiative-updates create --input \'{"initiativeId":"<id>","body":"Status update"}\'',
      ],
    },
    update: {
      examples: ['linear initiative-updates update <id> --input \'{"body":"Edited"}\''],
    },
  },
  projects: {
    list: {
      filters: ["project", "status", "filter", "sort"],
      pagination: "full",
      examples: [
        "linear projects list --limit 25 --view detail",
        'linear projects list --status "On track" --json',
      ],
    },
    create: {
      required: "name",
      examples: ['linear projects create --input \'{"name":"Roadmap","teamIds":["<team-id>"]}\''],
    },
    update: {
      examples: ['linear projects update <id> --input \'{"state":"completed"}\''],
    },
  },
  milestones: {
    list: {
      filters: ["project", "status", "filter", "sort"],
      pagination: "full",
      examples: ["linear milestones list --project <project-id> --json"],
    },
    create: {
      required: "name",
      examples: ['linear milestones create --input \'{"name":"Beta","projectId":"<id>"}\''],
    },
    update: {
      examples: ['linear milestones update <id> --input \'{"targetDate":"2026-06-01"}\''],
    },
  },
  "project-updates": {
    list: {
      filters: ["project", "status", "filter", "sort"],
      pagination: "full",
      examples: ["linear project-updates list --project <project-id> --json"],
    },
    create: {
      required: "body",
      examples: [
        'linear project-updates create --input \'{"projectId":"<id>","body":"Weekly update"}\'',
      ],
    },
    update: {
      examples: ['linear project-updates update <id> --input \'{"body":"Edited"}\''],
    },
  },
  documents: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear documents list --limit 25 --json"],
    },
    create: {
      required: "title",
      examples: ['linear documents create --input \'{"title":"Spec","content":"..."}\''],
    },
    update: {
      examples: ['linear documents update <id> --input \'{"title":"New title"}\''],
    },
  },
  cycles: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear cycles list --limit 25 --json"],
    },
    create: {
      required: "teamId",
      examples: [
        'linear cycles create --input \'{"teamId":"<id>","startsAt":"2026-06-01","endsAt":"2026-06-15"}\'',
      ],
    },
    update: {
      examples: ['linear cycles update <id> --input \'{"name":"Sprint 24"}\''],
    },
  },
  teams: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear teams list --limit 50 --json"],
    },
    create: {
      required: "name and key",
      examples: ['linear teams create --input \'{"name":"Engineering","key":"ENG"}\''],
    },
    update: {
      examples: ['linear teams update <id> --input \'{"description":"Platform team"}\''],
    },
  },
  users: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear users list --limit 50 --json"],
    },
    update: {
      examples: ["linear users update <id> --input '{\"active\":false}'"],
    },
  },
  labels: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear labels list --limit 50 --json"],
    },
    create: {
      required: "name",
      examples: [
        'linear labels create --input \'{"name":"bug","color":"#ef4444","teamId":"<id>"}\'',
      ],
    },
    update: {
      examples: ['linear labels update <id> --input \'{"color":"#10b981"}\''],
    },
  },
  comments: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear comments list --limit 25 --json"],
    },
    create: {
      required: "body",
      examples: ['linear comments create --input \'{"issueId":"<id>","body":"Looks good!"}\''],
    },
    update: {
      examples: ['linear comments update <id> --input \'{"body":"Edited"}\''],
    },
  },
  attachments: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear attachments list --limit 25 --json"],
    },
    create: {
      required: "title and url",
      examples: [
        'linear attachments create --input \'{"issueId":"<id>","title":"PR","url":"https://..."}\'',
      ],
    },
    update: {
      examples: ['linear attachments update <id> --input \'{"title":"Renamed"}\''],
    },
  },
  templates: {
    list: {
      filters: [],
      pagination: "none",
      examples: ["linear templates list --json", "linear templates list --view detail"],
    },
    create: {
      required: "name, type, and templateData",
      examples: [
        'linear templates create --input \'{"name":"Bug","type":"issue","templateData":{}}\'',
      ],
    },
    update: {
      examples: ['linear templates update <id> --input \'{"name":"Bug v2"}\''],
    },
  },
  notifications: {
    list: {
      filters: ["state", "status", "filter", "sort"],
      pagination: "full",
      examples: ["linear notifications list --limit 25 --json"],
    },
    update: {
      examples: ['linear notifications update <id> --input \'{"readAt":"2026-05-08T00:00:00Z"}\''],
    },
  },
  states: {
    list: {
      filters: [],
      pagination: "basic",
      examples: ["linear states list --limit 50 --json"],
    },
    create: {
      required: "name and teamId",
      examples: [
        'linear states create --input \'{"name":"In QA","type":"started","color":"#facc15","teamId":"<id>"}\'',
      ],
    },
    update: {
      examples: ['linear states update <id> --input \'{"name":"In Review"}\''],
    },
  },
};

function joinExamples(lines: readonly string[]): string {
  return lines.map((line) => `  ${line}`).join("\n");
}

function indentLines(lines: readonly string[]): string {
  return lines.map((line) => `  ${line}`).join("\n");
}

function buildOptionsBlock(help: ListHelp): string {
  const filterLines = help.filters.map((flag) => FILTER_FLAG_DESCRIPTIONS[flag]);
  const paginationLines = PAGINATION_LINES[help.pagination];
  const allLines = [...filterLines, ...paginationLines, ...OUTPUT_LINES];
  return indentLines(allLines);
}

function listHelp(help: ListHelp): string {
  const heading =
    help.filters.length > 0
      ? "Filters, pagination, and output (inherited globals):"
      : help.pagination === "none"
        ? "Output (inherited globals):"
        : "Pagination and output (inherited globals):";

  return `\n${heading}\n${buildOptionsBlock(help)}\n\nRun \`linear --help\` to see every global option.\n\nExamples:\n${joinExamples(help.examples)}`;
}

function createHelp(entity: string, help: CreateHelp): string {
  return `\nRequired input fields: ${help.required}\n\nExamples:\n${joinExamples(help.examples)}\n\n${inputDocsHint(entity)}`;
}

function updateHelp(entity: string, help: UpdateHelp): string {
  return `\nUpdate accepts any non-empty JSON payload.\n\nExamples:\n${joinExamples(help.examples)}\n\n${inputDocsHint(entity)}`;
}

export interface ResourceHelpTexts {
  resource?: string;
  list?: string;
  create?: string;
  update?: string;
}

export function getResourceHelpTexts(entity: string): ResourceHelpTexts {
  const examples = resourceExamples[entity];
  if (!examples) {
    return {};
  }

  const texts: ResourceHelpTexts = {};
  if (examples.list) {
    texts.list = listHelp(examples.list);
  }
  if (examples.create) {
    texts.create = createHelp(entity, examples.create);
  }
  if (examples.update) {
    texts.update = updateHelp(entity, examples.update);
  }
  if (examples.resource) {
    texts.resource = `\nExamples:\n${joinExamples(examples.resource)}`;
  }
  return texts;
}
