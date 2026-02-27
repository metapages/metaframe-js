import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useShortUrlMode } from "/@/hooks/useShortUrlMode";

// JSDOM doesn't allow direct assignment to window.location, so we replace it
// with a plain object that allows mutation and tracks navigations.
const setupLocation = (hash: string) => {
  const loc = {
    hash,
    href: `http://localhost/${hash}`,
    origin: "http://localhost",
  };
  Object.defineProperty(window, "location", { writable: true, value: loc });
  return loc;
};

describe("useShortUrlMode", () => {
  beforeEach(() => {
    delete window.__SHORT_URL_ID;
  });

  afterEach(() => {
    delete window.__SHORT_URL_ID;
  });

  it("does nothing when __SHORT_URL_ID is not set", () => {
    const loc = setupLocation("#?js=abc123");
    renderHook(() => useShortUrlMode());

    window.dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: "http://localhost/#?js=abc123",
        newURL: "http://localhost/#?js=abc123&edit=true",
      }),
    );

    expect(loc.href).toBe("http://localhost/#?js=abc123");
  });

  it("does not navigate when in short URL mode with no edit param", () => {
    window.__SHORT_URL_ID = "abc123def456";
    const loc = setupLocation("#?js=abc123");
    renderHook(() => useShortUrlMode());

    loc.hash = "#?js=abc123&modules=%5B%5D";
    window.dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: "http://localhost/#?js=abc123",
        newURL: "http://localhost/#?js=abc123&modules=%5B%5D",
      }),
    );

    // No edit=true, so no navigation
    expect(loc.href).toBe("http://localhost/#?js=abc123");
  });

  it("does not navigate when only the edit param is added", () => {
    window.__SHORT_URL_ID = "abc123def456";
    const loc = setupLocation("#?js=abc123");
    renderHook(() => useShortUrlMode());

    // Hash changes only by adding edit=true
    loc.hash = "#?js=abc123&edit=true";
    window.dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: "http://localhost/#?js=abc123",
        newURL: "http://localhost/#?js=abc123&edit=true",
      }),
    );

    expect(loc.href).toBe("http://localhost/#?js=abc123");
  });

  it("navigates to root when edit=true and content hash changed", () => {
    window.__SHORT_URL_ID = "abc123def456";
    const loc = setupLocation("#?js=abc123");
    renderHook(() => useShortUrlMode());

    // Content changed: js param is different
    loc.hash = "#?js=xyz789&edit=true";
    window.dispatchEvent(
      new HashChangeEvent("hashchange", {
        oldURL: "http://localhost/#?js=abc123",
        newURL: "http://localhost/#?js=xyz789&edit=true",
      }),
    );

    expect(loc.href).toBe("http://localhost/#?js=xyz789&edit=true");
  });
});
