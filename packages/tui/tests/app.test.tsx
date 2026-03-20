import { render } from "ink-testing-library";
import { describe, expect, test, vi } from "vitest";
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
          {
            id: "i_2",
            identifier: "ENG-2",
            title: "Second issue",
            priority: 1,
            url: "https://linear.app/issue/ENG-2",
            createdAt: "2024-01-02T00:00:00.000Z",
            updatedAt: "2024-01-02T00:00:00.000Z",
            stateName: "In Progress",
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
    async listInitiatives() {
      return {
        items: [
          {
            id: "n_1",
            name: "Initiative",
            status: "active",
            targetDate: "2024-02-01",
            url: "https://linear.app/initiative/1",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        nextCursor: null,
      };
    },
    async listDocuments() {
      return {
        items: [
          {
            id: "d_1",
            title: "Document",
            url: "https://linear.app/document/1",
            initiativeId: "init_1",
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
    const app = render(
      <App
        gateway={gateway}
        screen="issues"
        refreshToken={0}
        onRefresh={() => {}}
        onSelectScreen={() => {}}
        openUrl={async () => {}}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(app.lastFrame()).toContain("Linear TUI");
    expect(app.lastFrame()).toContain("Navigation");
    expect(app.lastFrame()).toContain("Details");
    expect(app.lastFrame()).toContain("Issue title");
    expect(app.lastFrame()).toContain("ENG-1");
    expect(app.lastFrame()).toContain("Todo");
    app.unmount();
  });

  test("does not refetch projects on every render", async () => {
    const listProjects = vi.fn(async () => ({
      items: [
        {
          id: "p_1",
          name: "Project",
          state: "planned",
          progress: 0.2,
          url: "https://linear.app/project/1",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      nextCursor: null,
    }));

    const gateway: TuiGateway = {
      ...createStubGateway(),
      listProjects,
    };

    const app = render(
      <App
        gateway={gateway}
        screen="projects"
        refreshToken={0}
        onRefresh={() => {}}
        onSelectScreen={() => {}}
        openUrl={async () => {}}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(listProjects).toHaveBeenCalledTimes(1);
    app.unmount();
  });

  test("advances to the next screen when pressing tab", async () => {
    const onSelectScreen = vi.fn();
    const app = render(
      <App
        gateway={createStubGateway()}
        screen="issues"
        refreshToken={0}
        onRefresh={() => {}}
        onSelectScreen={onSelectScreen}
        openUrl={async () => {}}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    app.stdin.write("\t");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSelectScreen).toHaveBeenCalledWith("projects");
    app.unmount();
  });

  test("moves to the previous screen when pressing shift+tab", async () => {
    const onSelectScreen = vi.fn();
    const app = render(
      <App
        gateway={createStubGateway()}
        screen="issues"
        refreshToken={0}
        onRefresh={() => {}}
        onSelectScreen={onSelectScreen}
        openUrl={async () => {}}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    app.stdin.write("\u001B[Z");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSelectScreen).toHaveBeenCalledWith("cycles");
    app.unmount();
  });

  test("moves to documents when pressing 4", async () => {
    const onSelectScreen = vi.fn();
    const app = render(
      <App
        gateway={createStubGateway()}
        screen="issues"
        refreshToken={0}
        onRefresh={() => {}}
        onSelectScreen={onSelectScreen}
        openUrl={async () => {}}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    app.stdin.write("4");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSelectScreen).toHaveBeenCalledWith("documents");
    app.unmount();
  });

  test("opens the selected issue in the browser when pressing o", async () => {
    const openUrl = vi.fn(async () => {});
    const gateway = createStubGateway();
    const app = render(
      <App
        gateway={gateway}
        screen="issues"
        refreshToken={0}
        onRefresh={() => {}}
        onSelectScreen={() => {}}
        openUrl={openUrl}
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
    app.stdin.write("o");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(openUrl).toHaveBeenCalledWith("https://linear.app/issue/ENG-1");
    app.unmount();
  });
});
