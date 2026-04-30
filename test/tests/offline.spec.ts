import { expect, test } from "@playwright/test";

async function createShortUrl(
  request: import("@playwright/test").APIRequestContext,
  js: string,
) {
  const response = await request.post("/api/shorten/json", {
    data: { js },
  });
  expect(response.ok()).toBeTruthy();
  return response.json() as Promise<{ id: string }>;
}

async function waitForServiceWorkerController(
  page: import("@playwright/test").Page,
) {
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
    { timeout: 30_000 },
  );
}

test.describe("offline mode (service worker cache)", () => {
  test("site shell loads from SW cache after going offline", async ({
    page,
    context,
  }) => {
    // First load: SW installs, activates with skipWaiting/clients.claim
    await page.goto("/?sw=force");
    await page.waitForLoadState("networkidle");
    await waitForServiceWorkerController(page);

    // Second load: SW now controls the page and caches all asset requests
    await page.reload();
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    try {
      // Reload offline — SW should serve the page and CDN assets from cache
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // Core DOM elements from worker/index.html should be present
      await expect(page.locator("#root")).toBeVisible({ timeout: 10_000 });
      // #menu-button is opacity:0 by default (invisible-until-hover class added by JS),
      // so use toBeAttached rather than toBeVisible
      await expect(page.locator("#menu-button")).toBeAttached();
    } finally {
      await context.setOffline(false);
    }
  });

  test("example with external CDN assets loads from SW cache when offline", async ({
    page,
    context,
    request,
  }) => {
    // Fetch a small JSON file from a CDN domain already in the SW's cacheableUrlPatterns.
    // We reuse the @metapages/hash-query package.json since that CDN host is guaranteed
    // to be in cache (the page itself imports from it).
    const js = `
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/@metapages/hash-query@0.9.12/package.json"
      );
      const pkg = await response.json();
      document.getElementById("root").textContent = "v" + pkg.version;
    `;

    const { id } = await createShortUrl(request, js);

    // Online: first load so the SW installs and activates
    await page.goto(`/j/${id}?sw=force`);
    await page.waitForLoadState("networkidle");

    // Confirm the user JS ran and the CDN asset was fetched successfully
    await expect(page.locator("#root")).toContainText("v0.9", {
      timeout: 15_000,
    });

    await waitForServiceWorkerController(page);

    // Second load: SW now controls the page and caches all CDN asset requests
    // (on the first visit the SW may not have been the controller when CDN modules
    // were fetched, so a second controlled visit ensures everything is cached)
    await page.reload();
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    try {
      // Reload offline — SW serves the cached page and CDN fetch
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      // User JS should run again using the SW-cached CDN response
      await expect(page.locator("#root")).toContainText("v0.9", {
        timeout: 15_000,
      });
    } finally {
      await context.setOffline(false);
    }
  });
});
