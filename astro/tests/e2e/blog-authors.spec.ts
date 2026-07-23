import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Blog authors index (/blog/authors/)", () => {
  test("renders author names as strings, not [object Object]", async ({ page }) => {
    await page.goto("/blog/authors/");

    await expect(page.locator("body")).not.toContainText("[object Object]");
    await expect(
      page.getByRole("link", { name: /Rachael Bradley Montgomery/i }),
    ).toBeVisible();
  });

  test("axe accessibility scan (informational, not gating)", async ({ page }) => {
    await page.goto("/blog/authors/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Author detail page (/blog/authors/rachael-bradley-montgomery/)", () => {
  const path = "/blog/authors/rachael-bradley-montgomery/";

  test("header shows formatted author name, not [object Object]", async ({ page }) => {
    await page.goto(path);

    await expect(page.locator("body")).not.toContainText("[object Object]");
    await expect(page.locator("body")).toContainText(
      "Blogs by Rachael Bradley Montgomery",
    );
  });

  test("breadcrumbs show ancestors and formatted author name as current page", async ({ page }) => {
    await page.goto(path);

    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav).toBeVisible();

    await expect(nav.getByRole("link")).toHaveText(["Home", "Blog", "Authors"]);

    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveText("Blogs by Rachael Bradley Montgomery");
    await expect(current).not.toContainText("[object Object]");
  });

  test("axe accessibility scan (informational, not gating)", async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
