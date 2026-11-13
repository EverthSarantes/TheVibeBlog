import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
  it("handles multiple spaces", () => {
    expect(slugify("Hello   World")).toBe("hello-world");
  });
  it("trims leading/trailing dashes", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
  it("handles spanish accents", () => {
    expect(slugify("Café Español")).toBe("caf-espaol");
  });
});