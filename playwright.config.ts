import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the frontend apps. Requires Playwright browsers + the apps
 * running: `pnpm add -D @playwright/test && npx playwright install && npx playwright test`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: { trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: "pnpm --filter @zkhelios/web dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI },
    { command: "pnpm --filter @zkhelios/dapp dev", url: "http://localhost:3001", reuseExistingServer: !process.env.CI },
  ],
});
