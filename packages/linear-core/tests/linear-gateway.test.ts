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
      throw createNotImplementedError("issue");
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
      throw createNotImplementedError("projects");
    },
    async project() {
      throw createNotImplementedError("project");
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
  };
}

describe("LinearGateway", () => {
  test("lists issues and maps fields", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.listIssues({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.identifier).toBe("ENG-1");
    expect(result.items[0]?.stateName).toBe("In Progress");
    expect(result.nextCursor).toBe("cursor-2");
  });

  test("archives cycle via delete operation", async () => {
    const gateway = new LinearGateway(createTestClient());
    const result = await gateway.deleteCycle("c_1");

    expect(result.success).toBe(true);
    expect(result.id).toBe("c_1");
  });
});
