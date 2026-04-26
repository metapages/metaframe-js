import { expect, test } from "@playwright/test";

// Helper: create a short URL via the JSON API and return the id.
async function createShortUrl(
  request: import("@playwright/test").APIRequestContext,
  js: string,
  extra?: Record<string, unknown>,
) {
  const response = await request.post("/api/shorten/json", {
    data: { js, ...extra },
  });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{
    id: string;
    shortUrl: string;
    fullUrl: string;
    hashParams: string;
  }>;
}

// ---------------------------------------------------------------------------
// API tests
// ---------------------------------------------------------------------------

test("POST /api/shorten/json returns id, shortUrl, fullUrl", async ({
  request,
}) => {
  const body = await createShortUrl(request, "console.log(1)");
  expect(body).toHaveProperty("id");
  expect(body).toHaveProperty("shortUrl");
  expect(body).toHaveProperty("fullUrl");
  expect(body).toHaveProperty("hashParams");
  expect(body.shortUrl).toContain("/j/");
});

test("GET /api/j/:sha256 returns id and hashParams", async ({ request }) => {
  const { id } = await createShortUrl(request, 'console.log("api test")');

  const response = await request.get(`/api/j/${id}`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.id).toBe(id);
  expect(body).toHaveProperty("hashParams");
});

// ---------------------------------------------------------------------------
// Browser tests – basic short URL serving
// ---------------------------------------------------------------------------

test("GET /j/:sha256 serves HTML without redirect, URL stays on /j/...", async ({
  page,
}) => {
  const { id } = await createShortUrl(
    page.request,
    'console.log("hello short url")',
  );

  const responses: string[] = [];
  page.on("response", (r) => responses.push(r.url()));

  await page.goto(`/j/${id}`);

  // URL should stay on /j/... (no redirect to /#)
  expect(page.url()).toContain(`/j/${id}`);
  expect(page.url()).not.toMatch(/^\/?#/);
});

test("window.__SHORT_URL_ID is set after visiting short URL", async ({
  page,
}) => {
  const { id } = await createShortUrl(page.request, "const x = 42;");

  await page.goto(`/j/${id}`);

  const shortUrlId = await page.evaluate(() => window.__SHORT_URL_ID);
  expect(shortUrlId).toBe(id);
});

// ---------------------------------------------------------------------------
// Browser tests – hash params must NOT leak into the URL bar
// ---------------------------------------------------------------------------

test("short URL does not show hash params in the URL after page load", async ({
  page,
}) => {
  const { id } = await createShortUrl(
    page.request,
    'console.log("no hash leak")',
  );

  await page.goto(`/j/${id}`);

  // Wait for the load-event cleanup to run
  await page.waitForLoadState("load");

  // The URL must be the clean short URL – no hash fragment with params
  const url = new URL(page.url());
  expect(url.pathname).toBe(`/j/${id}`);
  expect(url.hash).toBe("");
});

test("window.__SHORT_URL_HASH_PARAMS is set with the original hash params", async ({
  page,
}) => {
  const { id, hashParams } = await createShortUrl(
    page.request,
    "const y = 1;",
  );

  await page.goto(`/j/${id}`);
  await page.waitForLoadState("load");

  const storedParams = await page.evaluate(
    () => (window as any).__SHORT_URL_HASH_PARAMS,
  );
  expect(storedParams).toBeTruthy();
  // The stored params should contain the js hash param
  expect(storedParams).toContain("js=");
});

test("short URL page still executes the JS code correctly", async ({
  page,
}) => {
  // Use a script that writes visible output to the DOM
  const js = 'document.getElementById("root").textContent = "SHORT_URL_OK";';
  const { id } = await createShortUrl(page.request, js);

  await page.goto(`/j/${id}`);
  await page.waitForLoadState("load");

  // Verify the code ran – the root element should have our text
  await expect(page.locator("#root")).toHaveText("SHORT_URL_OK", {
    timeout: 10_000,
  });

  // And the URL should still be clean
  const url = new URL(page.url());
  expect(url.pathname).toBe(`/j/${id}`);
  expect(url.hash).toBe("");
});

// ---------------------------------------------------------------------------
// API + Browser tests – inputs are preserved in short URLs
// ---------------------------------------------------------------------------

test("POST /api/shorten/json with inputs preserves them in stored hash params", async ({
  request,
}) => {
  const inputs = { greeting: { type: "utf8", value: "hello world" } };
  const body = await createShortUrl(request, "console.log(1)", { inputs });

  // Verify inputs appear in the returned hash params
  expect(body.hashParams).toContain("inputs=");

  // Fetch the stored data and verify round-trip
  const response = await request.get(`/api/j/${body.id}`);
  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  const params = new URLSearchParams(data.hashParams.replace(/^\?/, ""));
  const storedInputs = JSON.parse(decodeURIComponent(params.get("inputs")!));
  expect(storedInputs).toEqual(inputs);
});

test("short URL with inputs delivers them to onInputs handler", async ({
  page,
}) => {
  // JS that exports onInputs – the handler writes received inputs to the DOM
  const js = [
    'export const onInputs = (inputs) => {',
    '  document.getElementById("root").textContent = JSON.stringify(inputs);',
    '};',
  ].join("\n");
  const inputs = {
    greeting: { type: "utf8", value: "hello from short url" },
  };
  const { id } = await createShortUrl(page.request, js, { inputs });

  await page.goto(`/j/${id}`);
  await page.waitForLoadState("load");

  // The onInputs handler should have been called with the resolved input.
  // DataRef { type: "utf8", value: "hello from short url" } resolves to "hello from short url"
  await expect(page.locator("#root")).toContainText("hello from short url", {
    timeout: 15_000,
  });
});

// ---------------------------------------------------------------------------
// Browser tests – edit button exits short URL mode
// ---------------------------------------------------------------------------

test("clicking edit on a short URL navigates to full hash URL", async ({
  page,
}) => {
  const { id } = await createShortUrl(
    page.request,
    'document.getElementById("root").textContent = "edit test";',
  );

  await page.goto(`/j/${id}`);
  await page.waitForLoadState("load");

  // Confirm we're on the short URL
  expect(new URL(page.url()).pathname).toBe(`/j/${id}`);

  // Click the edit button
  await page.click("#menu-button");

  // Should navigate to the root path with hash params including edit=true
  await page.waitForURL((url) => url.pathname === "/" && url.hash.includes("edit=true"), {
    timeout: 10_000,
  });

  const url = new URL(page.url());
  expect(url.pathname).toBe("/");
  expect(url.hash).toContain("js=");
  expect(url.hash).toContain("edit=true");

  // Should no longer be in short URL mode
  const shortUrlId = await page.evaluate(() => window.__SHORT_URL_ID);
  expect(shortUrlId).toBeUndefined();
});
