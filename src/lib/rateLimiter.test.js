import { describe, it, expect, beforeEach } from "vitest";
import { canPerform, resetRateLimit } from "./rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    resetRateLimit("test");
    resetRateLimit("comment");
  });

  it("allows first action", () => {
    expect(canPerform("test", 1000)).toBe(true);
  });

  it("blocks rapid repeated actions", () => {
    canPerform("test", 1000);
    expect(canPerform("test", 1000)).toBe(false);
  });

  it("allows action after cooldown", async () => {
    canPerform("test", 10);
    await new Promise((r) => setTimeout(r, 20));
    expect(canPerform("test", 10)).toBe(true);
  });

  it("tracks different actions independently", () => {
    canPerform("a", 1000);
    expect(canPerform("b", 1000)).toBe(true);
  });
});