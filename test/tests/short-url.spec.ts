import { expect, test } from "@playwright/test";

test("POST /api/shorten/json returns id, shortUrl, fullUrl", async ({
  request,
}) => {
  const response = await request.post("/api/shorten/json", {
    data: { js: "console.log(1)" },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toHaveProperty("id");
  expect(body).toHaveProperty("shortUrl");
  expect(body).toHaveProperty("fullUrl");
  expect(body).toHaveProperty("hashParams");
  expect(body.shortUrl).toContain("/j/");
});

test("GET /api/j/:sha256 returns id and hashParams", async ({ request }) => {
  const shortenResponse = await request.post("/api/shorten/json", {
    data: { js: 'console.log("api test")' },
  });
  expect(shortenResponse.ok()).toBeTruthy();
  const { id } = await shortenResponse.json();

  const response = await request.get(`/api/j/${id}`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.id).toBe(id);
  expect(body).toHaveProperty("hashParams");
});

test("GET /j/:sha256 serves HTML without redirect, URL stays on /j/...", async ({
  page,
}) => {
  const response = await page.request.post("/api/shorten/json", {
    data: { js: 'console.log("hello short url")' },
  });
  expect(response.ok()).toBeTruthy();
  const { id } = await response.json();

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
  const response = await page.request.post("/api/shorten/json", {
    data: { js: "const x = 42;" },
  });
  const { id } = await response.json();

  await page.goto(`/j/${id}`);

  const shortUrlId = await page.evaluate(() => window.__SHORT_URL_ID);
  expect(shortUrlId).toBe(id);
});
