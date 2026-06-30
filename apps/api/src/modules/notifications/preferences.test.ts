import { describe, it, expect } from "vitest";
import { DEFAULT_PREFERENCES, mergePreferences, wants } from "./preferences";

describe("mergePreferences", () => {
  it("returns defaults for empty input", () => {
    expect(mergePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
    expect(mergePreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });

  it("overlays stored values onto defaults", () => {
    const merged = mergePreferences({ channels: { email: true } });
    expect(merged.channels.email).toBe(true);
    expect(merged.channels.inApp).toBe(true); // default preserved
    expect(merged.events.proofVerified).toBe(true);
  });

  it("applies a patch over stored values", () => {
    const stored = { channels: { email: true, push: false, inApp: true } };
    const merged = mergePreferences(stored, { channels: { push: true } });
    expect(merged.channels.push).toBe(true);
    expect(merged.channels.email).toBe(true);
  });

  it("merges event toggles", () => {
    const merged = mergePreferences({}, { events: { circuitRegistered: true } });
    expect(merged.events.circuitRegistered).toBe(true);
    expect(merged.events.proofVerified).toBe(true);
  });
});

describe("wants", () => {
  it("requires both channel + event enabled", () => {
    const prefs = mergePreferences({ channels: { inApp: true, email: false, push: false } });
    expect(wants(prefs, "proofVerified", "inApp")).toBe(true);
    expect(wants(prefs, "proofVerified", "email")).toBe(false);
    expect(wants(prefs, "circuitRegistered", "inApp")).toBe(false); // event off by default
  });
});
