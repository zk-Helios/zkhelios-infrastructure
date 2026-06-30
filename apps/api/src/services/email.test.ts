import { describe, it, expect } from "vitest";
import { templates } from "./email";

describe("email templates", () => {
  it("embeds the verification code", () => {
    const html = templates.emailVerify("123456");
    expect(html).toContain("123456");
    expect(html).toContain("zk");
    expect(html).toContain("Helios");
  });

  it("includes an unsubscribe link for activity emails", () => {
    const html = templates.proofVerified("ABCDEFGH1234", "https://app.zkhelios.app/explorer/proof/x");
    expect(html).toContain("Unsubscribe");
    expect(html).toContain("https://app.zkhelios.app/explorer/proof/x");
  });

  it("renders a plain announcement without unsubscribe", () => {
    const html = templates.announcement("Heads up", "Something happened");
    expect(html).toContain("Heads up");
    expect(html).not.toContain("Unsubscribe");
  });
});
