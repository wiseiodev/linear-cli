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
            state: "active",
            priority: 2,
            progress: 0.42,
            url: "https://linear.app/project/agent-runtime",
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
        state: "active",
        priority: 2,
        progress: 0.42,
        url: "https://linear.app/project/agent-runtime",
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
      throw createNotImplementedError("cycles");
    },
    async cycle() {
      throw createNotImplementedError("cycle");
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
            status: "active",
            targetDate: "2026-04-01",
            url: "https://linear.app/initiative/agent-platform",
            updatedAt: new Date("2026-03-16T00:00:00.000Z"),
          },
        ],
        pageInfo: {
          endCursor: "initiative-cursor-2",
        },
      };
    },
    async initiative() {
      throw createNotImplementedError("initiative");
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
      throw createNotImplementedError("teams");
    },
    async team() {
      throw createNotImplementedError("team");
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
      throw createNotImplementedError("users");
    },
    async user() {
      throw createNotImplementedError("user");
    },
    async updateUser() {
      throw createNotImplementedError("updateUser");
    },
    async issueLabels() {
      throw createNotImplementedError("issueLabels");
    },
    async issueLabel() {
      throw createNotImplementedError("issueLabel");
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
      throw createNotImplementedError("comments");
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
      throw createNotImplementedError("attachments");
    },
    async attachment() {
      throw createNotImplementedError("attachment");
    },
    async createAttachment() {
      throw createNotImplementedError("createAttachment");
    },
    async deleteAttachment() {
      throw createNotImplementedError("deleteAttachment");
    },
    async workflowStates() {
      throw createNotImplementedError("workflowStates");
    },
    async workflowState() {
      throw createNotImplementedError("workflowState");
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
        type: "issue",
        teamId: "team_1",
        templateData: {
          description: "Steps to reproduce",
        },
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
    expect(result.items[0]?.status).toBe("active");
    expect(result.nextCursor).toBe("initiative-cursor-2");
  });

  test("lists projects and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listProjects({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Agent Runtime");
    expect(result.items[0]?.description).toBe("Core runtime improvements.");
    expect(result.nextCursor).toBe("project-cursor-2");
  });

  test("gets project details including description", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getProject("project_1");

    expect(result.id).toBe("project_1");
    expect(result.description).toBe("Core runtime improvements.");
  });

  test("lists documents and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listDocuments({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe("Agent rollout plan");
    expect(result.items[0]?.description).toBe("## Scope");
    expect(result.items[0]?.projectId).toBe("proj_1");
    expect(result.items[0]?.initiativeId).toBe("init_1");
    expect(result.nextCursor).toBe("document-cursor-2");
  });

  test("gets document details including description", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.getDocument("doc_1");

    expect(result.id).toBe("doc_1");
    expect(result.description).toBe("## Scope");
  });

  test("lists templates and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listTemplates();

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Bug Report");
    expect(result[0]?.type).toBe("issue");
    expect(result[0]?.teamId).toBe("team_1");
  });
});
