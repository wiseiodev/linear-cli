import { describe, expect, test } from "vitest";
import { LinearGateway } from "../src/entities/linear-gateway.js";
import type { SdkLinearClient } from "../src/entities/sdk-types.js";

function createNotImplementedError(name: string): Error {
  return new Error(`Not implemented in test client: ${name}`);
}

function createTestClient(): SdkLinearClient {
  return {
    async issues() {
      return {
        nodes: [
          {
            id: "i_1",
            number: 1,
            identifier: "ENG-1",
            title: "Fix parser",
            branchName: "eng-1-fix-parser",
            priority: 2,
            url: "https://linear.app/issue/ENG-1",
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
            state: Promise.resolve({
              id: "s_1",
              name: "In Progress",
              type: "started",
            }),
          },
        ],
        pageInfo: {
          endCursor: "cursor-2",
        },
      };
    },
    async issue() {
      return {
        id: "i_1",
        number: 1,
        identifier: "ENG-1",
        title: "Fix parser",
        description: "Parser crashes when a trailing comma is present.",
        branchName: "eng-1-fix-parser",
        priority: 2,
        teamId: "team_1",
        projectId: "project_1",
        url: "https://linear.app/issue/ENG-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
        state: Promise.resolve({
          id: "s_1",
          name: "In Progress",
          type: "started",
        }),
      };
    },
    async createIssue() {
      throw createNotImplementedError("createIssue");
    },
    async updateIssue() {
      throw createNotImplementedError("updateIssue");
    },
    async deleteIssue() {
      throw createNotImplementedError("deleteIssue");
    },
    async projects() {
      return {
        nodes: [
          {
            id: "project_1",
            name: "Agent Runtime",
            description: "Core runtime improvements.",
            content: "Project context markdown",
            color: "#0055FF",
            state: "active",
            priority: 2,
            progress: 0.42,
            targetDate: "2026-04-01",
            url: "https://linear.app/project/agent-runtime",
            createdAt: new Date("2026-03-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "project-cursor-2",
        },
      };
    },
    async project() {
      return {
        id: "project_1",
        name: "Agent Runtime",
        description: "Core runtime improvements.",
        content: "Project context markdown",
        color: "#0055FF",
        state: "active",
        priority: 2,
        progress: 0.42,
        targetDate: "2026-04-01",
        url: "https://linear.app/project/agent-runtime",
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      };
    },
    async createProject() {
      throw createNotImplementedError("createProject");
    },
    async updateProject() {
      throw createNotImplementedError("updateProject");
    },
    async deleteProject() {
      throw createNotImplementedError("deleteProject");
    },
    async documents() {
      return {
        nodes: [
          {
            id: "doc_1",
            title: "Agent rollout plan",
            content: "## Scope",
            color: "#00AA88",
            url: "https://linear.app/docs/agent-rollout-plan",
            projectId: "proj_1",
            initiativeId: "init_1",
            createdAt: new Date("2026-03-15T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "document-cursor-2",
        },
      };
    },
    async document() {
      return {
        id: "doc_1",
        title: "Agent rollout plan",
        content: "## Scope",
        color: "#00AA88",
        url: "https://linear.app/docs/agent-rollout-plan",
        projectId: "proj_1",
        initiativeId: "init_1",
        createdAt: new Date("2026-03-15T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      };
    },
    async createDocument() {
      throw createNotImplementedError("createDocument");
    },
    async updateDocument() {
      throw createNotImplementedError("updateDocument");
    },
    async deleteDocument() {
      throw createNotImplementedError("deleteDocument");
    },
    async cycles() {
      return {
        nodes: [
          {
            id: "c_1",
            number: 8,
            name: "Cycle 8",
            description: "Cycle for platform hardening.",
            progress: 0.7,
            startsAt: new Date("2026-03-01T00:00:00.000Z"),
            endsAt: new Date("2026-03-14T00:00:00.000Z"),
            isActive: true,
            teamId: "team_1",
            createdAt: new Date("2026-02-27T00:00:00.000Z"),
            updatedAt: new Date("2026-03-05T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "cycle-cursor-2",
        },
      };
    },
    async cycle() {
      return {
        id: "c_1",
        number: 8,
        name: "Cycle 8",
        description: "Cycle for platform hardening.",
        progress: 0.7,
        startsAt: new Date("2026-03-01T00:00:00.000Z"),
        endsAt: new Date("2026-03-14T00:00:00.000Z"),
        isActive: true,
        teamId: "team_1",
        createdAt: new Date("2026-02-27T00:00:00.000Z"),
        updatedAt: new Date("2026-03-05T00:00:00.000Z"),
      };
    },
    async createCycle() {
      throw createNotImplementedError("createCycle");
    },
    async updateCycle() {
      throw createNotImplementedError("updateCycle");
    },
    async archiveCycle() {
      return {
        entityId: "c_1",
        success: true,
      };
    },
    async initiatives() {
      return {
        nodes: [
          {
            id: "init_1",
            name: "Agent Platform",
            description: "Make agents useful",
            content: "Initiative execution details.",
            color: "#FF5500",
            status: "active",
            targetDate: "2026-04-01",
            url: "https://linear.app/initiative/agent-platform",
            createdAt: new Date("2026-02-28T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "initiative-cursor-2",
        },
      };
    },
    async initiative() {
      return {
        id: "init_1",
        name: "Agent Platform",
        description: "Make agents useful",
        content: "Initiative execution details.",
        color: "#FF5500",
        status: "active",
        targetDate: "2026-04-01",
        url: "https://linear.app/initiative/agent-platform",
        createdAt: new Date("2026-02-28T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      };
    },
    async createInitiative() {
      throw createNotImplementedError("createInitiative");
    },
    async updateInitiative() {
      throw createNotImplementedError("updateInitiative");
    },
    async deleteInitiative() {
      throw createNotImplementedError("deleteInitiative");
    },
    async teams() {
      return {
        nodes: [
          {
            id: "team_1",
            key: "ENG",
            name: "Engineering",
            displayName: "Engineering",
            description: "Product engineering team.",
            color: "#123456",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-01T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "team-cursor-2",
        },
      };
    },
    async team() {
      return {
        id: "team_1",
        key: "ENG",
        name: "Engineering",
        displayName: "Engineering",
        description: "Product engineering team.",
        color: "#123456",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      };
    },
    async createTeam() {
      throw createNotImplementedError("createTeam");
    },
    async updateTeam() {
      throw createNotImplementedError("updateTeam");
    },
    async deleteTeam() {
      throw createNotImplementedError("deleteTeam");
    },
    async users() {
      return {
        nodes: [
          {
            id: "user_1",
            name: "Alex Example",
            displayName: "Alex",
            description: "Staff engineer",
            email: "alex@example.com",
            active: true,
            url: "https://linear.app/user/alex",
            createdAt: new Date("2026-01-10T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "user-cursor-2",
        },
      };
    },
    async user() {
      return {
        id: "user_1",
        name: "Alex Example",
        displayName: "Alex",
        description: "Staff engineer",
        email: "alex@example.com",
        active: true,
        url: "https://linear.app/user/alex",
        createdAt: new Date("2026-01-10T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      };
    },
    async updateUser() {
      throw createNotImplementedError("updateUser");
    },
    async issueLabels() {
      return {
        nodes: [
          {
            id: "label_1",
            name: "Bug",
            description: "Reliability issue",
            color: "#FF0000",
            teamId: "team_1",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-15T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "label-cursor-2",
        },
      };
    },
    async issueLabel() {
      return {
        id: "label_1",
        name: "Bug",
        description: "Reliability issue",
        color: "#FF0000",
        teamId: "team_1",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-15T00:00:00.000Z"),
      };
    },
    async createIssueLabel() {
      throw createNotImplementedError("createIssueLabel");
    },
    async updateIssueLabel() {
      throw createNotImplementedError("updateIssueLabel");
    },
    async deleteIssueLabel() {
      throw createNotImplementedError("deleteIssueLabel");
    },
    async comments() {
      return {
        nodes: [
          {
            id: "comment_1",
            body: "Looks good",
            url: "https://linear.app/comment/comment_1",
            createdAt: new Date("2026-03-15T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
            issueId: "i_1",
          },
        ],
        pageInfo: {
          endCursor: "comment-cursor-2",
        },
      };
    },
    async comment() {
      return {
        id: "comment_1",
        body: "Looks good",
        url: "https://linear.app/comment/comment_1",
        createdAt: new Date("2026-03-15T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
        issueId: "i_1",
      };
    },
    async createComment() {
      throw createNotImplementedError("createComment");
    },
    async updateComment() {
      throw createNotImplementedError("updateComment");
    },
    async deleteComment() {
      throw createNotImplementedError("deleteComment");
    },
    async attachments() {
      return {
        nodes: [
          {
            id: "att_1",
            title: "Sentry ticket",
            subtitle: "SENTRY-221",
            url: "https://sentry.io/issues/221",
            sourceType: "sentry",
            createdAt: new Date("2026-03-14T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "attachment-cursor-2",
        },
      };
    },
    async attachment() {
      return {
        id: "att_1",
        title: "Sentry ticket",
        subtitle: "SENTRY-221",
        url: "https://sentry.io/issues/221",
        sourceType: "sentry",
        createdAt: new Date("2026-03-14T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      };
    },
    async createAttachment() {
      throw createNotImplementedError("createAttachment");
    },
    async updateAttachment() {
      return {
        attachment: Promise.resolve({
          id: "att_1",
          title: "Updated attachment",
          subtitle: "SENTRY-221",
          url: "https://sentry.io/issues/221",
          sourceType: "sentry",
          createdAt: new Date("2026-03-14T00:00:00.000Z"),
          updatedAt: new Date("2026-03-17T00:00:00.000Z"),
        }),
      };
    },
    async deleteAttachment() {
      throw createNotImplementedError("deleteAttachment");
    },
    async workflowStates() {
      return {
        nodes: [
          {
            id: "state_1",
            name: "In Progress",
            description: "Work is ongoing",
            type: "started",
            color: "#00FF00",
            teamId: "team_1",
            createdAt: new Date("2026-01-05T00:00:00.000Z"),
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "state-cursor-2",
        },
      };
    },
    async workflowState() {
      return {
        id: "state_1",
        name: "In Progress",
        description: "Work is ongoing",
        type: "started",
        color: "#00FF00",
        teamId: "team_1",
        createdAt: new Date("2026-01-05T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      };
    },
    async createWorkflowState() {
      throw createNotImplementedError("createWorkflowState");
    },
    async updateWorkflowState() {
      throw createNotImplementedError("updateWorkflowState");
    },
    async archiveWorkflowState() {
      throw createNotImplementedError("archiveWorkflowState");
    },
    templates: Promise.resolve([
      {
        id: "tpl_1",
        name: "Bug Report",
        description: "Track a bug",
        color: "#FF8800",
        type: "issue",
        teamId: "team_1",
        templateData: {
          description: "Steps to reproduce",
        },
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      },
    ]),
    async template() {
      throw createNotImplementedError("template");
    },
    async createTemplate() {
      throw createNotImplementedError("createTemplate");
    },
    async updateTemplate() {
      throw createNotImplementedError("updateTemplate");
    },
    async deleteTemplate() {
      throw createNotImplementedError("deleteTemplate");
    },
  };
}

describe("LinearGateway", () => {
  test("lists issues and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listIssues({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.number).toBe(1);
    expect(result.items[0]?.identifier).toBe("ENG-1");
    expect(result.items[0]?.branchName).toBe("eng-1-fix-parser");
    expect(result.items[0]?.stateName).toBe("In Progress");
    expect(result.nextCursor).toBe("cursor-2");
  });

  test("gets issue branch name by identifier", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getIssueBranchName("ENG-1");

    expect(result.identifier).toBe("ENG-1");
    expect(result.branchName).toBe("eng-1-fix-parser");
  });

  test("gets issue details including description", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getIssue("ENG-1");

    expect(result.number).toBe(1);
    expect(result.identifier).toBe("ENG-1");
    expect(result.description).toBe("Parser crashes when a trailing comma is present.");
    expect(result.stateName).toBe("In Progress");
  });

  test("archives cycle via delete operation", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.deleteCycle("c_1");

    expect(result.success).toBe(true);
    expect(result.id).toBe("c_1");
  });

  test("lists initiatives and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listInitiatives({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Agent Platform");
    expect(result.items[0]?.content).toBe("Initiative execution details.");
    expect(result.items[0]?.color).toBe("#FF5500");
    expect(result.items[0]?.createdAt).toBe("2026-02-28T00:00:00.000Z");
    expect(result.items[0]?.status).toBe("active");
    expect(result.nextCursor).toBe("initiative-cursor-2");
  });

  test("lists projects and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listProjects({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Agent Runtime");
    expect(result.items[0]?.description).toBe("Core runtime improvements.");
    expect(result.items[0]?.content).toBe("Project context markdown");
    expect(result.items[0]?.color).toBe("#0055FF");
    expect(result.items[0]?.targetDate).toBe("2026-04-01");
    expect(result.items[0]?.createdAt).toBe("2026-03-01T00:00:00.000Z");
    expect(result.nextCursor).toBe("project-cursor-2");
  });

  test("gets project details including description", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getProject("project_1");

    expect(result.id).toBe("project_1");
    expect(result.description).toBe("Core runtime improvements.");
    expect(result.content).toBe("Project context markdown");
    expect(result.color).toBe("#0055FF");
    expect(result.targetDate).toBe("2026-04-01");
    expect(result.createdAt).toBe("2026-03-01T00:00:00.000Z");
  });

  test("lists documents and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listDocuments({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe("Agent rollout plan");
    expect(result.items[0]?.description).toBe("## Scope");
    expect(result.items[0]?.color).toBe("#00AA88");
    expect(result.items[0]?.projectId).toBe("proj_1");
    expect(result.items[0]?.initiativeId).toBe("init_1");
    expect(result.nextCursor).toBe("document-cursor-2");
  });

  test("gets document details including description", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getDocument("doc_1");

    expect(result.id).toBe("doc_1");
    expect(result.description).toBe("## Scope");
    expect(result.color).toBe("#00AA88");
  });

  test("gets cycle details including description and timestamps", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getCycle("c_1");

    expect(result.id).toBe("c_1");
    expect(result.description).toBe("Cycle for platform hardening.");
    expect(result.createdAt).toBe("2026-02-27T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-03-05T00:00:00.000Z");
  });

  test("gets team details including color and timestamps", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getTeam("team_1");

    expect(result.id).toBe("team_1");
    expect(result.color).toBe("#123456");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-03-01T00:00:00.000Z");
  });

  test("gets user details including description and url", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getUser("user_1");

    expect(result.id).toBe("user_1");
    expect(result.description).toBe("Staff engineer");
    expect(result.url).toBe("https://linear.app/user/alex");
    expect(result.createdAt).toBe("2026-01-10T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-03-16T00:00:00.000Z");
  });

  test("gets label details including description and timestamps", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getLabel("label_1");

    expect(result.id).toBe("label_1");
    expect(result.description).toBe("Reliability issue");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-03-15T00:00:00.000Z");
  });

  test("gets comment details including url", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getComment("comment_1");

    expect(result.id).toBe("comment_1");
    expect(result.url).toBe("https://linear.app/comment/comment_1");
  });

  test("updates attachment and maps subtitle and updatedAt", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.updateAttachment("att_1", { title: "Updated attachment" });

    expect(result.id).toBe("att_1");
    expect(result.subtitle).toBe("SENTRY-221");
    expect(result.updatedAt).toBe("2026-03-17T00:00:00.000Z");
  });

  test("gets workflow state details including description and timestamps", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getWorkflowState("state_1");

    expect(result.id).toBe("state_1");
    expect(result.description).toBe("Work is ongoing");
    expect(result.createdAt).toBe("2026-01-05T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-03-16T00:00:00.000Z");
  });

  test("lists templates and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listTemplates();

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Bug Report");
    expect(result[0]?.color).toBe("#FF8800");
    expect(result[0]?.type).toBe("issue");
    expect(result[0]?.teamId).toBe("team_1");
    expect(result[0]?.createdAt).toBe("2026-03-01T00:00:00.000Z");
  });
});
