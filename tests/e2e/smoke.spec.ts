import { test, expect } from "@playwright/test";

test.describe("marketing site", () => {
  test("landing loads with the hero headline", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await expect(page.getByRole("heading", { name: /Solana speed/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Launch App/i }).first()).toBeVisible();
  });
});

test.describe("dApp", () => {
  test("dApp shell + connect prompt render", async ({ page }) => {
    await page.goto("http://localhost:3001/");
    // Protected dashboard shows the connect-wallet gate when unauthenticated.
    await expect(page.getByText(/Connect your wallet/i)).toBeVisible();
  });

  test("verify page (public) loads", async ({ page }) => {
    await page.goto("http://localhost:3001/verify");
    await expect(page.getByText(/Verify/i).first()).toBeVisible();
  });
});

// Wallet connect + SIWS + proof flows require a mock wallet adapter — wire with
// @solana/wallet-adapter test utilities or a seeded browser extension in CI.
