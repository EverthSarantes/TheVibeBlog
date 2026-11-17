import { describe, it, expect, beforeEach } from "vitest";
import { cacheGet, cacheSet, cacheInvalidate, cacheInvalidatePrefix } from "./cache";

describe("cache", () => {
  beforeEach(() => {
    cacheInvalidate();
  });

  it("stores and retrieves data", () => {
    cacheSet("key1", { foo: "bar" }, 10000);
    expect(cacheGet("key1")).toEqual({ foo: "bar" });
  });

  it("returns null for missing keys", () => {
    expect(cacheGet("nonexistent")).toBeNull();
  });

  it("expires after TTL", async () => {
    cacheSet("key2", "value", 10);
    await new Promise((r) => setTimeout(r, 20));
    expect(cacheGet("key2")).toBeNull();
  });

  it("invalidates a specific key", () => {
    cacheSet("key3", "value", 10000);
    cacheInvalidate("key3");
    expect(cacheGet("key3")).toBeNull();
  });

  it("invalidates by prefix", () => {
    cacheSet("articles:1", "a", 10000);
    cacheSet("articles:2", "b", 10000);
    cacheSet("users:1", "c", 10000);
    cacheInvalidatePrefix("articles:");
    expect(cacheGet("articles:1")).toBeNull();
    expect(cacheGet("articles:2")).toBeNull();
    expect(cacheGet("users:1")).toBe("c");
  });
});