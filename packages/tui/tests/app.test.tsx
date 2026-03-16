import { render } from "ink-testing-library";
import { describe, expect, test } from "vitest";
import { App } from "../src/App.js";
import type { TuiGateway } from "../src/types.js";

function createStubGateway(): TuiGateway {
  return {
    async listIssues() {
      return {
        items: [
          {
            id: "i_1",
            identifier: "ENG-1",
            title: "Issue title",
            priority: 2,
            url: "https://linear.app/issue/ENG-1",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
            stateName: "Todo",
          },
        ],
        nextCursor: null,
      };
    },
    async listProjects() {
      return {
        items: [
          {
            id: "p_1",
            name: "Project",
            state: "planned",
            priority: 2,
            progress: 0.2,
            url: "https://linear.app/project/1",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        nextCursor: null,
      };
    },
    async listCycles() {
      return {
        items: [
          {
            id: "c_1",
            number: 1,
            progress: 0.5,
            startsAt: "2024-01-01T00:00:00.000Z",
            endsAt: "2024-01-14T00:00:00.000Z",
            isActive: true,
          },
        ],
        nextCursor: null,
      };
    },
  };
}

describe("App", () => {
  test("renders issues screen by default", async () => {
    const gateway = createStubGateway();
    const app = render(<App gateway={gateway} initialScreen="issues" />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(app.lastFrame()).toContain("Linear TUI");
    expect(app.lastFrame()).toContain("Issue title");
    app.unmount();
  });
});
