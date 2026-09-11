import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("daily rarity game supports preview, one answer and shareable result", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Aloita" })).toBeEnabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Aloita" }).click();
  await expect(page.getByText("Lue kysymys rauhassa")).toBeVisible();
  await expect(page.getByLabel("Vastauksesi")).toHaveCount(0);
  await page.waitForTimeout(3_200);
  await expect(page.getByLabel("Vastauksesi")).toBeFocused();
  await page.getByLabel("Vastauksesi").fill("Suomi");
  await page.getByLabel("Vastauksesi").press("Enter");
  await expect(page.getByText(/HYVÄKSYTTY|EI TÄLLÄ KERTAA/)).toBeVisible();
  for (let index = 1; index < 7; index++) {
    await page.getByRole("button", { name: "Seuraava kysymys" }).click();
    await page.waitForTimeout(3_200);
    await page.getByRole("button", { name: "Ohita" }).click();
    await expect(page.getByRole("button", { name: index === 6 ? "Katso tulos" : "Seuraava kysymys" })).toBeVisible();
  }
  await page.getByRole("button", { name: "Katso tulos" }).click();
  await expect(page.getByRole("heading", { name: "Päivän tulos" })).toBeVisible();
  await expect(page.getByText(/\/ 700/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value: string) => { document.documentElement.dataset.copied = value; } }, configurable: true });
  });
  await page.getByRole("button", { name: "Jaa tulos" }).click();
  await expect(page.getByRole("status")).toContainText("kopioitu");
  const copied = await page.evaluate(() => document.documentElement.dataset.copied ?? "");
  expect(copied).toContain("MYLVISA");
  expect(copied).not.toContain("Suomi");
});

test("keyboard flow reaches the field after preview", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Lue kysymys rauhassa")).toBeVisible();
  await page.waitForTimeout(3_200);
  await expect(page.getByLabel("Vastauksesi")).toBeFocused();
  await page.keyboard.type("Testi");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Seuraava kysymys" })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Lue kysymys rauhassa")).toBeVisible();
});

test("a round accepts only one final submission", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/quiz")) posts++;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita" }).click();
  await page.waitForTimeout(3_200);
  await page.getByLabel("Vastauksesi").fill("Testi");
  await page.getByRole("button", { name: "Lukitse" }).dblclick();
  await expect(page.getByRole("button", { name: "Seuraava kysymys" })).toBeVisible();
  expect(posts).toBe(1);
});
