import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const variants = [
  {
    path: "/escape-room/",
    heading: "Ready to take a look?",
    supporting: false,
  },
  {
    path: "/escape-room/our-story/",
    heading: "Ready to take a look?",
    supporting: false,
  },
  {
    path: "/escape-room/how-it-works/",
    heading: "Easy assembly…",
    supporting: true,
  },
];

for (const colorScheme of ["light", "dark"] as const) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 820, height: 1180 }, // iPad portrait
    { width: 1180, height: 820 }, // iPad landscape
    { width: 390, height: 844 }, // mobile
    { width: 320, height: 640 }, // narrow mobile / zoom reflow
  ]) {
    test.describe(`${colorScheme} ${viewport.width}px call to action`, () => {
      test.use({ viewport, colorScheme });
      for (const variant of variants) {
        test(variant.path, async ({ page }) => {
          // External video/analytics requests are unrelated to this component.
          await page.route("**/*", (route) => {
            const url = new URL(route.request().url());
            return (
                url.hostname === "localhost" || url.hostname === "127.0.0.1"
              ) ?
                route.continue()
              : route.abort();
          });
          await page.goto(variant.path, { waitUntil: "domcontentloaded" });
          const callout = page.getByRole("region", {
            name: variant.heading,
            exact: true,
          });
          await expect(
            callout.getByRole("heading", { name: variant.heading, level: 2 }),
          ).toBeVisible();
          // Verify the preference changes the panel itself, not just surrounding content.
          const background = await callout.evaluate(
            (el) => getComputedStyle(el).backgroundColor,
          );
          expect(background).toBe(
            colorScheme === "dark" ? "rgb(56, 61, 70)" : "rgb(244, 244, 244)",
          );
          const link = callout.getByRole("link", {
            name: "See our escape rooms",
            exact: true,
          });
          await expect(link).toHaveCSS("background-color", "rgb(57, 89, 153)");
          await expect(link).toHaveCSS("color", "rgb(255, 255, 255)");
          await expect(callout.getByRole("heading", { level: 2 })).toHaveCSS(
            "color",
            colorScheme === "dark" ? "rgb(126, 176, 228)" : "rgb(8, 21, 104)",
          );
          await expect(link).toHaveAttribute("href", "/escape-room/themes");
          await expect(link).toBeVisible();
          const bounds = await callout.boundingBox();
          expect(bounds).not.toBeNull();
          expect(bounds!.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
          expect(
            await callout.evaluate((el) => el.scrollWidth <= el.clientWidth),
          ).toBe(true);
          expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);

          // Move away and back with the keyboard, including pages with video iframes.
          await link.focus();
          await page.keyboard.press("Tab");
          await page.keyboard.press("Shift+Tab");
          await expect(link).toBeFocused();
          expect(
            await link.evaluate((el) => getComputedStyle(el).outlineStyle),
          ).toBe("solid");
          if (variant.supporting) {
            await page.keyboard.press("Tab");
            const email = callout.getByRole("link", { name: "Email us" });
            await expect(email).toBeFocused();
            await expect(email).toHaveAttribute(
              "href",
              "mailto:escaperoom@accessiblecommunity.org",
            );
          } else {
            await expect(callout.getByRole("link")).toHaveCount(1);
          }
          // Scope to the reusable component so unrelated page issues do not hide regressions.
          const results = await new AxeBuilder({ page })
            .include(".call-to-action")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(results.violations).toEqual([]);
          await link.click();
          await expect(page).toHaveURL(/\/escape-room\/themes\/?$/);
        });
      }
    });
  }
}
