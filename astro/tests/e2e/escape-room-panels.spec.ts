import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const layouts = [
  { name: "mobile", width: 390, columns: 1 },
  { name: "tablet", width: 768, columns: 2 },
  { name: "desktop", width: 1440, columns: 3 },
];

for (const path of ["/escape-room/", "/rooms/"]) {
  for (const layout of layouts) {
    for (const colorScheme of ["light", "dark"] as const) {
      test(`${path} room panels at ${layout.name} in ${colorScheme} mode`, async ({ page }) => {
        await page.setViewportSize({ width: layout.width, height: 900 });
        await page.emulateMedia({ colorScheme });
        const response = await page.goto(path);
        expect(response?.ok()).toBe(true);

        const section = page.getByRole("region", { name: "Our Rooms" });
        const cards = section.getByRole("article");
        await expect(cards).toHaveCount(3);
        await expect(section.getByRole("heading", { level: path === "/rooms/" ? 2 : 3 })).toHaveText([
          "A Baking Bonanza",
          "A Corporate Conundrum",
          "Virtual Escape Room",
        ]);
        await expect(section.getByRole("link", { name: "Learn more about A Baking Bonanza" }))
          .toHaveAttribute("href", "/escape-room/themes/kitchen/");
        await expect(section.getByRole("link", { name: "Learn more about A Corporate Conundrum" }))
          .toHaveAttribute("href", "/escape-room/themes/corporate/");
        await expect(section.getByText("Set up in your own space", { exact: true })).toHaveCount(2);
        const virtualRoom = cards.filter({ has: page.getByRole("heading", { name: "Virtual Escape Room" }) });
        await expect(virtualRoom.getByText(/^Access our virtual escape room/)).toBeVisible();
        await expect(virtualRoom.getByRole("listitem")).toHaveText(["4-X players", "X minutes play time"]);
        await expect(virtualRoom.getByRole("link", { name: "Learn more about Virtual Escape Room" }))
          .toHaveAttribute("href", /^mailto:escaperoom@accessiblecommunity\.org/);

        for (const card of await cards.all()) {
          const gap = await card.evaluate((element) => {
            const details = element.querySelector("ul")!;
            const availability = details.nextElementSibling!;
            return availability.getBoundingClientRect().top - details.getBoundingClientRect().bottom;
          });
          expect(gap).toBeGreaterThanOrEqual(24);
        }

        const bounds = await cards.evaluateAll((elements) =>
          elements.map((element) => {
            const { top, left, right } = element.getBoundingClientRect();
            return { top, left, right };
          }),
        );
        expect(bounds.filter(({ top }) => top === bounds[0].top)).toHaveLength(layout.columns);
        for (const { left, right } of bounds) {
          expect(left).toBeGreaterThanOrEqual(0);
          expect(right).toBeLessThanOrEqual(layout.width);
        }

        const results = await new AxeBuilder({ page }).include("#our-rooms").analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
}

test("the escape-room homepage links to the new rooms listing", async ({ page }) => {
  await page.goto("/escape-room/");
  await page.getByRole("link", { name: "Explore our rooms" }).click();
  await expect(page).toHaveURL(/\/rooms\/$/);
  await expect(page.getByRole("heading", { name: "Our Rooms", level: 1 })).toBeVisible();
});
