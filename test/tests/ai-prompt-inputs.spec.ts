import { expect, test } from "@playwright/test";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("AI copy button includes inputs in clipboard text", async ({
  page,
  baseURL,
}) => {
  // Build the editor URL directly with hash params containing code + inputs
  const js = btoa(encodeURIComponent('console.log("ai-test");'));
  const inputs = JSON.stringify({
    mydata: { type: "utf8", value: "foo bar" },
    greeting: { type: "utf8", value: "hello world" },
  });
  const editorUrl = `${baseURL}/editor/#?js=${js}&inputs=${encodeURIComponent(inputs)}`;

  await page.goto(editorUrl);

  // Wait for and click the AI copy button (editor loads directly, no iframe)
  const aiButton = page.locator('[data-testid="ai-copy-button"]');
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
