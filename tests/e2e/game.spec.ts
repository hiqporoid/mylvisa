import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import latestBank from "../../src/data/releases/2026-09-13.json" with { type: "json" };
import initialBank from "../../src/data/releases/2026-09-11.json" with { type: "json" };
import { helsinkiDate } from "../../src/lib/quiz/date";
import { selectDailyQuestions } from "../../src/lib/quiz/selection";
import { questionSchema } from "../../src/lib/quiz/schema";

function todayQuestions() {
  const date = helsinkiDate();
  const latest = date >= "2026-09-13";
  const bank = (latest ? latestBank : initialBank).map((question) => questionSchema.parse(question));
  return selectDailyQuestions(bank, date, {
    length: 7,
    seed: latest ? "2026-09-13-mylvinta-v5" : "2026-09-11-editorial-v4",
    epoch: latest ? "2026-09-13" : "2026-09-01",
  });
}

test("Daily keeps invalid retries open, animates acceptance and recaps seven rounds", async ({ page }) => {
  const questions = todayQuestions();
  const accepted = questions[0].answers[0].canonical;
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Aloita" })).toBeEnabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Aloita" }).click();
  await expect(page.getByText("Lue kysymys rauhassa")).toBeVisible();
  await expect(page.getByLabel("Vastauksesi")).toHaveCount(0);
  await page.waitForTimeout(3_200);
  const field = page.getByLabel("Vastauksesi");
  await expect(field).toBeFocused();
  await field.fill("ei varmasti kelpaava vastaus");
  await field.press("Enter");
  await expect(page.getByText("Ei osumaa, kokeile uudelleen.")).toBeVisible();
  await expect(field).toHaveValue("ei varmasti kelpaava vastaus");
  await expect(field).toBeVisible();
  await field.fill("toinen täysin väärä yritys");
  await field.press("Enter");
  await expect(field).toBeFocused();
  await field.fill(accepted);
  await field.press("Enter");
  await expect(page.getByText("Hyväksytty", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mylvintäaalto etenee/)).toBeVisible();
  await expect(page.getByLabel(/Mylvintäaalto:/)).not.toHaveAttribute("aria-label", /Mylvintäaalto: 0 \/ 7000/);
  await expect(page.getByRole("button", { name: "Jatka mylvintää" })).toBeVisible({ timeout: 3_000 });

  for (let index = 1; index < 7; index++) {
    await page.getByRole("button", { name: "Jatka mylvintää" }).click();
    await expect(page.getByText("Lue kysymys rauhassa")).toBeVisible();
    await page.waitForTimeout(3_200);
    await page.getByRole("button", { name: "Ohita" }).click();
    await expect(page.getByRole("button", { name: index === 6 ? "Katso yhteenveto" : "Jatka mylvintää" })).toBeVisible();
  }
  await page.getByRole("button", { name: "Katso yhteenveto" }).click();
  await expect(page.getByRole("heading", { name: "Mylvintäsi tänään" })).toBeVisible();
  await expect(page.getByText("/ 700 p")).toBeVisible();
  await expect(page.locator(".recap-list > li")).toHaveCount(7);
  await expect(page.locator(".recap-list")).toContainText(questions[0].prompt);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value: string) => { document.documentElement.dataset.copied = value; } }, configurable: true });
  });
  await page.getByRole("button", { name: "Jaa tulos" }).click();
  await expect(page.getByRole("status")).toContainText("kopioitu");
  const copied = await page.evaluate(() => document.documentElement.dataset.copied ?? "");
  expect(copied).toContain("MYLVISA");
  expect(copied).not.toContain(accepted);
});

test("keyboard stays in the same answer field after an invalid attempt", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Aloita" })).toBeEnabled();
  await page.getByRole("button", { name: "Aloita" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3_200);
  await expect(page.getByLabel("Vastauksesi")).toBeFocused();
  await page.keyboard.type("Testi joka ei osu");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Ei osumaa, kokeile uudelleen.")).toBeVisible();
  await expect(page.getByLabel("Vastauksesi")).toBeFocused();
});

test("double submit produces only one terminal round", async ({ page }) => {
  const accepted = todayQuestions()[0].answers[0].canonical;
  let posts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/api/quiz")) posts++; });
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita" }).click();
  await page.waitForTimeout(3_200);
  await page.getByLabel("Vastauksesi").fill(accepted);
  await page.getByRole("button", { name: "Tarkista" }).dblclick();
  await expect(page.getByText("Hyväksytty", { exact: true })).toBeVisible();
  expect(posts).toBe(1);
});

test("editorial intent asks for confirmation without stopping the clock", async ({ page }) => {
  const questions = todayQuestions();
  const targetIndex = questions.findIndex((question) => question.answers.some((answer) => answer.intentAliases.length));
  test.skip(targetIndex < 0, "Today's deterministic set has no editorial intent alias");
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita" }).click();
  for (let index = 0; index < targetIndex; index++) {
    await page.waitForTimeout(3_200);
    await page.getByRole("button", { name: "Ohita" }).click();
    await page.getByRole("button", { name: "Jatka mylvintää" }).click();
  }
  await page.waitForTimeout(3_200);
  const target = questions[targetIndex];
  const answer = target.answers.find((candidate) => candidate.intentAliases.length)!;
  const before = await page.getByRole("timer").getAttribute("aria-label");
  await page.getByLabel("Vastauksesi").fill(answer.intentAliases[0]);
  await page.getByLabel("Vastauksesi").press("Enter");
  const panel = page.locator(".confirmation-panel");
  await expect(panel).toContainText("Tarkoititko tätä?");
  await expect(panel).toContainText(answer.canonical);
  await expect(panel).not.toContainText(/\d+ p|Harvinainen|Täysosuma/);
  await page.waitForTimeout(1_100);
  const after = await page.getByRole("timer").getAttribute("aria-label");
  expect(after).not.toBe(before);
  await expect(page.getByRole("button", { name: "Hyväksy vastaus" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Hyväksytty", { exact: true })).toBeVisible();
});

test("reduced motion preserves numeric and milestone progression", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita" }).click();
  await page.waitForTimeout(3_200);
  await page.getByLabel("Vastauksesi").fill(todayQuestions()[0].answers[0].canonical);
  await page.getByLabel("Vastauksesi").press("Enter");
  await expect(page.getByLabel(/Mylvintäaalto:/)).toContainText("");
  await expect(page.getByText(/MYLV/).first()).toBeVisible();
});
