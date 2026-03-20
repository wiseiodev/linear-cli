import { describe, expect, test } from "vitest";
import { LinearGateway } from "../src/entities/linear-gateway.js";
import type { SdkLinearClient } from "../src/entities/sdk-types.js";

function createV2Client(): SdkLinearClient {
  return {
    async issue() {
      return {
        id: "i_1",
        number: 1,
        identifier: "ENG-1",
        title: "Fix parser",
        description: "Parser crashes when a trailing comma is present.",
        branchName: "eng-1-fix-parser",
        priority: 2,
        estimate: 3,
        dueDate: "2026-04-01",
        url: "https://linear.app/issue/ENG-1",
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-02T00:00:00.000Z"),
        state: Promise.resolve({
          id: "state_1",
          name: "In Progress",
          type: "started",
        }),
        assignee: Promise.resolve({
          id: "user_1",
          name: "Alex Example",
          displayName: "Alex",
          email: "alex@example.com",
          active: true,
          url: "https://linear.app/user/alex",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        }),
        project: Promise.resolve({
          id: "project_1",
          name: "CLI v2",
          state: "active",
          priority: 2,
          progress: 0.5,
          url: "https://linear.app/project/cli-v2",
          createdAt: new Date("2026-02-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        }),
        cycle: Promise.resolve({
          id: "cycle_1",
          number: 9,
          name: "Cycle 9",
          progress: 0.3,
          startsAt: new Date("2026-03-01T00:00:00.000Z"),
          endsAt: new Date("2026-03-14T00:00:00.000Z"),
          isActive: true,
          createdAt: new Date("2026-02-25T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        }),
        team: Promise.resolve({
          id: "team_1",
          key: "ENG",
          name: "Engineering",
          displayName: "Engineering",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        }),
        projectMilestone: Promise.resolve({
          id: "milestone_1",
          name: "Beta",
          progress: 0.75,
          sortOrder: 1,
          status: "inProgress",
          targetDate: "2026-04-15",
          createdAt: new Date("2026-02-20T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
          project: Promise.resolve({
            id: "project_1",
            name: "CLI v2",
            state: "active",
            priority: 2,
            progress: 0.5,
            url: "https://linear.app/project/cli-v2",
            createdAt: new Date("2026-02-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-01T00:00:00.000Z"),
          }),
        }),
        parent: Promise.resolve({
          id: "i_parent",
          identifier: "ENG-0",
          title: "Parent issue",
        }),
        async labels() {
          return {
            nodes: [
              {
                id: "label_1",
                name: "Bug",
                description: "Reliability issue",
                color: "#ff0000",
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                updatedAt: new Date("2026-03-01T00:00:00.000Z"),
              },
            ],
          };
        },
        async children() {
          return {
            nodes: [
              {
                id: "i_child",
              },
            ],
          };
        },
        async relations() {
          return {
            nodes: [
              {
                id: "rel_1",
                type: "blocks",
              },
            ],
          };
        },
      };
    },
    async customers() {
      return {
        nodes: [
          {
            id: "customer_1",
            name: "Acme",
            slugId: "acme",
            approximateNeedCount: 3,
            domains: ["acme.com"],
            externalIds: ["zendesk:1"],
            revenue: 120000,
            size: 300,
            url: "https://linear.app/customer/acme",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-10T00:00:00.000Z"),
            owner: Promise.resolve({
              id: "user_1",
              name: "Alex Example",
              displayName: "Alex",
              email: "alex@example.com",
              active: true,
              url: "https://linear.app/user/alex",
              createdAt: new Date("2026-01-01T00:00:00.000Z"),
              updatedAt: new Date("2026-03-01T00:00:00.000Z"),
            }),
            status: Promise.resolve({
              id: "status_1",
              name: "Active",
            }),
            tier: Promise.resolve({
              id: "tier_1",
              name: "Enterprise",
            }),
            needs: [],
          },
        ],
        pageInfo: {
          endCursor: "customer-cursor-2",
        },
      };
    },
    async customer() {
      const connection = await this.customers();
      return connection.nodes[0];
    },
    async customerNeeds() {
      return {
        nodes: [
          {
            id: "need_1",
            body: "Need SSO support",
            priority: 1,
            createdAt: new Date("2026-03-01T00:00:00.000Z"),
            updatedAt: new Date("2026-03-10T00:00:00.000Z"),
            url: "https://linear.app/request/need_1",
            customer: Promise.resolve({
              id: "customer_1",
              name: "Acme",
            }),
            issue: Promise.resolve({
              id: "i_1",
              identifier: "ENG-1",
              title: "Fix parser",
            }),
            project: Promise.resolve({
              id: "project_1",
              name: "CLI v2",
            }),
          },
        ],
        pageInfo: {
          endCursor: "need-cursor-2",
        },
      };
    },
    async customerNeed() {
      const connection = await this.customerNeeds();
      return connection.nodes[0];
    },
    async projectMilestones() {
      return {
        nodes: [
          {
            id: "milestone_1",
            name: "Beta",
            description: "Beta launch milestone",
            progress: 0.75,
            sortOrder: 1,
            status: "inProgress",
            targetDate: "2026-04-15",
            createdAt: new Date("2026-02-20T00:00:00.000Z"),
            updatedAt: new Date("2026-03-01T00:00:00.000Z"),
            project: Promise.resolve({
              id: "project_1",
              name: "CLI v2",
            }),
          },
        ],
        pageInfo: {
          endCursor: "milestone-cursor-2",
        },
      };
    },
    async projectMilestone() {
      const connection = await this.projectMilestones();
      return connection.nodes[0];
    },
    async projectUpdates() {
      return {
        nodes: [
          {
            id: "pu_1",
            body: "Project update body",
            health: "onTrack",
            createdAt: new Date("2026-03-10T00:00:00.000Z"),
            updatedAt: new Date("2026-03-10T00:00:00.000Z"),
            url: "https://linear.app/update/project/pu_1",
            isStale: false,
            isDiffHidden: false,
            commentCount: 2,
            slugId: "pu-1",
            reactionData: {},
            reactions: [],
            project: Promise.resolve({
              id: "project_1",
              name: "CLI v2",
            }),
            user: Promise.resolve({
              id: "user_1",
              name: "Alex Example",
              displayName: "Alex",
              email: "alex@example.com",
              active: true,
              url: "https://linear.app/user/alex",
              createdAt: new Date("2026-01-01T00:00:00.000Z"),
              updatedAt: new Date("2026-03-01T00:00:00.000Z"),
            }),
          },
        ],
        pageInfo: {
          endCursor: "project-update-cursor-2",
        },
      };
    },
    async projectUpdate() {
      const connection = await this.projectUpdates();
      return connection.nodes[0];
    },
    async initiativeUpdates() {
      return {
        nodes: [
          {
            id: "iu_1",
            body: "Initiative update body",
            health: "onTrack",
            createdAt: new Date("2026-03-11T00:00:00.000Z"),
            updatedAt: new Date("2026-03-11T00:00:00.000Z"),
            url: "https://linear.app/update/initiative/iu_1",
            isStale: false,
            isDiffHidden: false,
            commentCount: 1,
            slugId: "iu-1",
            reactionData: {},
            reactions: [],
            initiative: Promise.resolve({
              id: "initiative_1",
              name: "Agent Platform",
            }),
            user: Promise.resolve({
              id: "user_1",
              name: "Alex Example",
              displayName: "Alex",
              email: "alex@example.com",
              active: true,
              url: "https://linear.app/user/alex",
              createdAt: new Date("2026-01-01T00:00:00.000Z"),
              updatedAt: new Date("2026-03-01T00:00:00.000Z"),
            }),
          },
        ],
        pageInfo: {
          endCursor: "initiative-update-cursor-2",
        },
      };
    },
    async initiativeUpdate() {
      const connection = await this.initiativeUpdates();
      return connection.nodes[0];
    },
    async notifications() {
      return {
        nodes: [
          {
            id: "notification_1",
            type: "issueAssignedToYou",
            category: "assignments",
            createdAt: new Date("2026-03-12T00:00:00.000Z"),
            updatedAt: new Date("2026-03-12T00:00:00.000Z"),
            readAt: null,
            snoozedUntilAt: null,
            user: Promise.resolve({
              id: "user_1",
              name: "Alex Example",
              displayName: "Alex",
              email: "alex@example.com",
              active: true,
              url: "https://linear.app/user/alex",
              createdAt: new Date("2026-01-01T00:00:00.000Z"),
              updatedAt: new Date("2026-03-01T00:00:00.000Z"),
            }),
          },
        ],
        pageInfo: {
          endCursor: "notification-cursor-2",
        },
      };
    },
    async notification() {
      const connection = await this.notifications();
      return connection.nodes[0];
    },
  } as unknown as SdkLinearClient;
}

describe("LinearGateway v2", () => {
  test("gets enriched issue details with related names and summaries", async () => {
    const gateway = new LinearGateway(createV2Client());

    const issue = await gateway.getIssue("ENG-1");

    expect(issue.assigneeName).toBe("Alex");
    expect(issue.projectName).toBe("CLI v2");
    expect(issue.cycleName).toBe("Cycle 9");
    expect(issue.teamKey).toBe("ENG");
    expect(issue.milestoneName).toBe("Beta");
    expect(issue.parentIdentifier).toBe("ENG-0");
    expect(issue.labelNames).toEqual(["Bug"]);
    expect(issue.childCount).toBe(1);
    expect(issue.relationCount).toBe(1);
    expect(issue.estimate).toBe(3);
    expect(issue.dueDate).toBe("2026-04-01");
  });

  test("lists customers with owner, status, and tier names", async () => {
    const gateway = new LinearGateway(createV2Client());

    const result = await gateway.listCustomers({ limit: 10 });

    expect(result.items[0]).toMatchObject({
      id: "customer_1",
      name: "Acme",
      ownerName: "Alex",
      statusName: "Active",
      tierName: "Enterprise",
      approximateNeedCount: 3,
    });
    expect(result.nextCursor).toBe("customer-cursor-2");
  });

  test("lists milestones, updates, and notifications", async () => {
    const gateway = new LinearGateway(createV2Client());

    const milestones = await gateway.listProjectMilestones({ limit: 10 });
    const projectUpdates = await gateway.listProjectUpdates({ limit: 10 });
    const initiativeUpdates = await gateway.listInitiativeUpdates({ limit: 10 });
    const notifications = await gateway.listNotifications({ limit: 10 });

    expect(milestones.items[0]).toMatchObject({
      name: "Beta",
      projectName: "CLI v2",
      status: "inProgress",
    });
    expect(projectUpdates.items[0]).toMatchObject({
      body: "Project update body",
      health: "onTrack",
      projectName: "CLI v2",
      userName: "Alex",
    });
    expect(initiativeUpdates.items[0]).toMatchObject({
      body: "Initiative update body",
      health: "onTrack",
      initiativeName: "Agent Platform",
      userName: "Alex",
    });
    expect(notifications.items[0]).toMatchObject({
      type: "issueAssignedToYou",
      category: "assignments",
      userName: "Alex",
      isRead: false,
    });
  });
});
