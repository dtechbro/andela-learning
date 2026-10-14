import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function setup(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Set up my course" }).click();
  await page.getByLabel("Cell structure", { exact: false }).check();
  await page.getByLabel("Membranes & transport", { exact: false }).check();
  await page.getByRole("button", { name: "Save my course" }).click();
  await expect(
    page.getByRole("heading", { name: "Keep your learning close." }),
  ).toBeVisible();
}
async function finish(page: Page) {
  const show = page.getByRole("button", { name: "I don’t know — show answer" });
  const results = page.getByRole("heading", {
    name: "A small step worth taking.",
  });
  for (let i = 0; i < 5; i++) {
    await show.click();
    const next = page.getByRole("button", {
      name: /Next question|See session results/,
    });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(show.or(results)).toBeVisible();
    if (await results.isVisible()) return;
  }
  throw new Error("Expected session completion within five questions");
}

test("complete practice, hint, self-assessment, flags, history, revision and deletion", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Start a short review" }).click();
  await page.getByRole("radio", { name: /A plasma membrane/ }).check();
  await page.getByRole("radio", { name: "Confident", exact: true }).check();
  await page.getByRole("button", { name: "Give me a hint" }).click();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await expect(
    page.getByText("Progress saved on this device.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Flag this question" }).click();
  await expect(
    page.getByRole("button", { name: "Flagged on this device" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next question" }).click();
  await finish(page);
  await expect(
    page.getByRole("heading", { name: "A small step worth taking." }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Start a short review" }).click();
  await expect(
    page.getByRole("textbox", { name: "Your explanation" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Your explanation" })
    .fill("Prokaryotic cells have no membrane-bound nucleus.");
  await page.getByRole("radio", { name: "Somewhat confident" }).check();
  await page.getByRole("button", { name: "Check my answer" }).click();
  await page.getByRole("button", { name: "Included the key points" }).click();
  await expect(
    page.getByText("Recorded as recalled independently.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause & return home" }).click();
  await page
    .getByRole("button", { name: "Exam revision", exact: true })
    .click();
  await page.getByRole("button", { name: "Start exam revision" }).click();
  await expect(
    page.getByText("Needed help or another attempt last time", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause & return home" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Clear my progress" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Clear my progress" }).click();
  await page.getByRole("button", { name: "Yes, delete progress" }).click();
  await expect(
    page.getByRole("button", { name: "Set up my course" }),
  ).toBeVisible();
});
test("demo isolation and paused session reload", async ({ page }) => {
  await setup(page);
  await page.getByRole("button", { name: "Start a short review" }).click();
  await page.getByRole("button", { name: "Skip question" }).click();
  await expect(page.getByText("Question 2 of 5")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Resume session/ }).click();
  await expect(page.getByText("Question 2 of 5")).toBeVisible();
  await page.getByRole("button", { name: "Pause & return home" }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Try demo mode" }).click();
  await expect(
    page.getByText("Demo mode · simulated learning history"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Exit demo", exact: true }).click();
  await page.getByRole("button", { name: "My topics", exact: true }).click();
  await expect(
    page.getByText("1 attempts", { exact: false }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByText("2 studied topics · 5 questions per session"),
  ).toBeVisible();
});
test("cached production works offline and persists answers", async ({
  page,
  context,
}) => {
  await setup(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Start a short review" }).click();
  await finish(page);
  await expect(
    page.getByRole("heading", { name: "A small step worth taking." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Needs another attempt", { exact: true }).first(),
  ).toBeVisible();
  await context.setOffline(false);
});
test("mobile layout, accessibility, and keyboard setup", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Set up my course" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Set up my course" }).focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Cell structure", { exact: false }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Save my course" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Start a short review" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("radio", { name: /A plasma membrane/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("radio", { name: "Confident", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Check my answer" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Let’s make this clearer." }),
  ).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("empty topics and three-question sessions remain usable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Set up my course" }).click();
  await page.getByRole("button", { name: "Save my course" }).click();
  await page.getByRole("button", { name: "Start a short review" }).click();
  await expect(
    page.getByText("No eligible questions.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Record what I studied", exact: false })
    .click();
  await page.getByLabel("Cell structure", { exact: false }).check();
  await page.getByLabel("Questions per session").selectOption("3");
  await page.getByRole("button", { name: "Save my course" }).click();
  await page.getByRole("button", { name: "Start a short review" }).click();
  await expect(page.getByText("Question 1 of 3")).toBeVisible();
  await finish(page);
  await expect(
    page.getByRole("heading", { name: "A small step worth taking." }),
  ).toBeVisible();
});

test("storage failure gives an honest temporary-session fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new Error("Storage denied");
      },
    });
  });
  await setup(page);
  await expect(page.getByRole("alert")).toContainText("temporary session");
  await page.getByRole("button", { name: "Start a short review" }).click();
  await page
    .getByRole("button", { name: "I don’t know — show answer" })
    .click();
  await expect(
    page.getByText("Kept in this tab.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Progress saved on this device.", { exact: false }),
  ).toHaveCount(0);
});

test("main pages have accessible mobile controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  for (const target of ["home", "setup", "topics", "exam", "settings"]) {
    if (target === "setup")
      await page
        .getByRole("button", { name: "Record what I studied", exact: false })
        .click();
    else if (target !== "home")
      await page
        .getByRole("button", {
          name:
            target === "topics"
              ? "My topics"
              : target === "exam"
                ? "Exam revision"
                : "Settings",
          exact: true,
        })
        .click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
