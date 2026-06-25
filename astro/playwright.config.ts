import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In the Docker e2e container, never auto-open/serve the report after a run:
  // it would bind to the container's localhost (unreachable via the port map)
  // and block the run. View it explicitly there with `make report-e2e`. Local
  // (non-Docker) runs keep the convenient auto-open on failure.
  reporter: [["html", { open: process.env.DOCKER_E2E ? "never" : "on-failure" }]],
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
