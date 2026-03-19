import { expect, test } from "@playwright/test";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

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

test("AI copy button includes inputs in clipboard text", async ({ page }) => {
  const js = 'console.log("ai-test");';
  const inputs = {
    mydata: { type: "utf8", value: "foo bar" },
    greeting: { type: "utf8", value: "hello world" },
  };

  const { fullUrl } = await createShortUrl(page.request, js, { inputs });

  // Open in edit mode
  const editUrl = fullUrl + "&edit=true";
  await page.goto(editUrl);

  // Wait for the editor iframe to appear
  const editorFrame = page.frameLocator('iframe[src*="/editor/"]');

  // Wait for and click the AI copy button inside the editor iframe
  const aiButton = editorFrame.locator('[data-testid="ai-copy-button"]');
  await aiButton.waitFor({ state: "visible", timeout: 15_000 });
  await aiButton.click();

  // Read clipboard contents
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );

  // Assert clipboard contains input keys and values
  expect(clipboardText).toContain("mydata");
  expect(clipboardText).toContain("foo bar");
  expect(clipboardText).toContain("greeting");
  expect(clipboardText).toContain("hello world");
});
