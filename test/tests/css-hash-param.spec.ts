import { expect, test } from "@playwright/test";

// The transient `css` hash param loads a global stylesheet into the JS
// renderer (worker/index.html) at runtime. The value is base64-encoded and is
// either raw CSS text or a URL to a stylesheet. It is intentionally applied
// ONLY by the renderer, never by the code editor iframe, and is never
// persisted into the metaframe definition or short URLs.

const ELEMENT_ID = "mtfm-css-hash-param";

// Matches @metapages/hash-query string encoding: btoa(encodeURIComponent(v)).
const encode = (value: string): string => btoa(encodeURIComponent(value));

// Build a full (non-short-url) hash URL from raw js/css values.
const hashUrl = (params: { js?: string; css?: string }): string => {
  const parts: string[] = [];
  if (params.js !== undefined) parts.push(`js=${encode(params.js)}`);
  if (params.css !== undefined) parts.push(`css=${encode(params.css)}`);
  return `/#?${parts.join("&")}`;
};

test("raw CSS is injected as a <style> in the renderer head and styles the output", async ({
  page,
}) => {
  const js =
    'document.getElementById("root").innerHTML = \'<p class="mtfm-test">hi</p>\';';
  const css = ".mtfm-test { color: rgb(255, 0, 0); }";

  await page.goto(hashUrl({ js, css }));
  await page.waitForLoadState("load");

  // The injected element exists, is a <style>, and lives in <head>.
  const el = page.locator(`#${ELEMENT_ID}`);
  await expect(el).toHaveCount(1);
  const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  expect(tag).toBe("style");
  const inHead = await el.evaluate((n) => n.parentElement?.tagName.toLowerCase());
  expect(inHead).toBe("head");

  // The CSS actually applies to the rendered output.
  await expect(page.locator("p.mtfm-test")).toHaveCSS("color", "rgb(255, 0, 0)", {
    timeout: 10_000,
  });
});

test("a stylesheet URL is injected as a <link rel=stylesheet>", async ({
  page,
}) => {
  const cssUrl = "https://example.com/theme.css";
  await page.goto(hashUrl({ js: "void 0;", css: cssUrl }));
  await page.waitForLoadState("load");

  const el = page.locator(`#${ELEMENT_ID}`);
  await expect(el).toHaveCount(1);
  const info = await el.evaluate((n) => ({
    tag: n.tagName.toLowerCase(),
    rel: n.getAttribute("rel"),
    href: n.getAttribute("href"),
  }));
  expect(info.tag).toBe("link");
  expect(info.rel).toBe("stylesheet");
  expect(info.href).toBe(cssUrl);
});

test("changing the css param replaces the stylesheet, clearing removes it", async ({
  page,
}) => {
  await page.goto(hashUrl({ js: "void 0;", css: ".a { color: red; }" }));
  await page.waitForLoadState("load");

  await expect(page.locator(`#${ELEMENT_ID}`)).toHaveCount(1);
  expect(
    await page.locator(`#${ELEMENT_ID}`).evaluate((n) => n.textContent),
  ).toContain("color: red");

  // Update only the css param (a hashchange). This must replace, not duplicate.
  await page.evaluate(
    (hash) => {
      window.location.hash = hash;
    },
    `?js=${encode("void 0;")}&css=${encode(".b { color: blue; }")}`,
  );

  await expect
    .poll(async () =>
      page.locator(`#${ELEMENT_ID}`).evaluate((n) => n.textContent),
    )
    .toContain("color: blue");
  // Still exactly one element (replaced, not appended).
  await expect(page.locator(`#${ELEMENT_ID}`)).toHaveCount(1);

  // Clearing the css param removes the element entirely.
  await page.evaluate(
    (hash) => {
      window.location.hash = hash;
    },
    `?js=${encode("void 0;")}`,
  );
  await expect(page.locator(`#${ELEMENT_ID}`)).toHaveCount(0);
});

test("the code editor iframe does NOT apply the css param", async ({ page }) => {
  // The editor is served at /editor/ and must ignore the css param entirely;
  // only the renderer (the top-level page) reacts to it.
  await page.goto(`/editor/#?css=${encode(".a { color: red; }")}`);
  await page.waitForLoadState("load");

  await expect(page.locator(`#${ELEMENT_ID}`)).toHaveCount(0);
});
