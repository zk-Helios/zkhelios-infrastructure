import { describe, it, expect } from "vitest";
import { encodeCursor, decodeCursor, clampLimit, DEFAULT_LIMIT, MAX_LIMIT } from "./pagination";
import { toCsv } from "../utils/csv";

describe("cursor codec", () => {
  it("round-trips a value", () => {
    const c = encodeCursor("sig_123");
    expect(decodeCursor(c)).toBe("sig_123");
  });
  it("returns null for empty / bad input", () => {
    expect(decodeCursor(null)).toBeNull();
    expect(decodeCursor(undefined)).toBeNull();
  });
});

describe("clampLimit", () => {
  it("defaults + caps", () => {
    expect(clampLimit(undefined)).toBe(DEFAULT_LIMIT);
    expect(clampLimit(0)).toBe(DEFAULT_LIMIT);
    expect(clampLimit(5)).toBe(5);
    expect(clampLimit(9999)).toBe(MAX_LIMIT);
  });
});

describe("toCsv", () => {
  it("escapes quotes/commas/newlines", () => {
    const csv = toCsv(["a", "b"], [["x,y", 'he said "hi"']]);
    expect(csv).toBe(`a,b\n"x,y","he said ""hi"""`);
  });
});
