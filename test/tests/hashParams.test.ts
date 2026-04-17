import { describe, expect, it } from "vitest";

import {
  DEFAULT_ALLOWED_HASH_PARAMS,
  getAllowedHashParams,
  stripDisallowedHashParams,
} from "/@/utils/hashParams";

describe("getAllowedHashParams", () => {
  it("returns the defaults when no definition is supplied", () => {
    const allowed = getAllowedHashParams(undefined);
    for (const name of DEFAULT_ALLOWED_HASH_PARAMS) {
      expect(allowed.has(name)).toBe(true);
    }
  });

  it("includes user-whitelisted params from an object-shaped definition", () => {
    const allowed = getAllowedHashParams({
      metadata: { name: "x" },
      hashParams: {
        myCustom: { type: "string" },
        anotherOne: { type: "boolean" },
      },
    } as any);
    expect(allowed.has("myCustom")).toBe(true);
    expect(allowed.has("anotherOne")).toBe(true);
    // defaults still present
    expect(allowed.has("js")).toBe(true);
    expect(allowed.has("inputs")).toBe(true);
  });

  it("includes user-whitelisted params from an array-shaped definition", () => {
    const allowed = getAllowedHashParams({
      metadata: { name: "x" },
      hashParams: ["myCustom", "anotherOne"],
    } as any);
    expect(allowed.has("myCustom")).toBe(true);
    expect(allowed.has("anotherOne")).toBe(true);
    expect(allowed.has("js")).toBe(true);
  });
});

describe("stripDisallowedHashParams", () => {
  const defaults = getAllowedHashParams();

  it("keeps params in the allowed list", () => {
    const url = "http://localhost/#?js=abc&inputs=%7B%7D";
    const result = stripDisallowedHashParams(url, defaults);
    expect(result).toContain("js=abc");
    expect(result).toContain("inputs=");
  });

  it("removes params not in the allowed list", () => {
    const url =
      "http://localhost/#?js=abc&foo=bar&baz=qux&inputs=%7B%7D";
    const result = stripDisallowedHashParams(url, defaults);
    expect(result).toContain("js=abc");
    expect(result).toContain("inputs=");
    expect(result).not.toContain("foo=bar");
    expect(result).not.toContain("baz=qux");
  });

  it("keeps user-whitelisted params declared in the definition", () => {
    const allowed = getAllowedHashParams({
      metadata: { name: "x" },
      hashParams: { myCustom: { type: "string" } },
    } as any);
    const url = "http://localhost/#?js=abc&myCustom=hello&foo=bar";
    const result = stripDisallowedHashParams(url, allowed);
    expect(result).toContain("js=abc");
    expect(result).toContain("myCustom=hello");
    expect(result).not.toContain("foo=bar");
  });

  it("returns a url with no hash params unchanged", () => {
    const url = "http://localhost/";
    expect(stripDisallowedHashParams(url, defaults)).toBe(url);
  });

  it("strips everything when nothing is allowed", () => {
    const url = "http://localhost/#?foo=bar&baz=qux";
    const result = stripDisallowedHashParams(url, new Set());
    expect(result).not.toContain("foo=bar");
    expect(result).not.toContain("baz=qux");
  });
});
