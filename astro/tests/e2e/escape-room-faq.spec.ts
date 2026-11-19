import { expect, test } from "@playwright/test";

test("escape room FAQs expand and collapse by click and keyboard", async ({ page }) => {
  await page.goto("/escape-room/how-it-works/");

  const faq = page.locator("#faq");
  const openItems = faq.locator("details[open]");
  const kitAnswer = faq.getByText("Each escape room kit comes with the following:");
  const playAnswer = faq.getByText("In general, our escape rooms will take between", { exact: false });
  const playQuestion = faq.locator("summary").filter({ hasText: "How long does it take to play an escape room?" });

  await expect(faq.locator("summary")).toHaveCount(6);
  await expect(openItems).toHaveCount(1);
  await expect(kitAnswer).toBeVisible();
  await expect(playAnswer).toBeHidden();

  await playQuestion.click();
  await expect(openItems).toHaveCount(1);
  await expect(kitAnswer).toBeHidden();
  await expect(playAnswer).toBeVisible();

  await expect(playQuestion).toBeFocused();
  await page.keyboard.press("Space");
  await expect(openItems).toHaveCount(0);
  await expect(playAnswer).toBeHidden();

  await page.keyboard.press("Enter");
  await expect(openItems).toHaveCount(1);
  await expect(playAnswer).toBeVisible();
});
