import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { releases } from "../../src/data/releases";
import { addDays } from "../../src/lib/quiz/date";
import type { QuizResponse } from "../../src/lib/quiz/contracts";
const bank = releases[0].questions;
test("play, recover progress, share, restore completion and practise", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Aloita päivän visa" }),
  ).toBeEnabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const initial = (await (
    await page.request.get("/api/quiz")
  ).json()) as QuizResponse;
  expect(initial.results).toEqual([]);
  expect(Object.keys(initial.current!).sort()).toEqual([
    "category",
    "id",
    "number",
    "question",
  ]);
  let game = initial;
  await page.getByRole("button", { name: "Aloita päivän visa" }).click();
  for (let i = 0; i < initial.length; i++) {
    const question = bank.find((q) => q.id === game.current?.id)!;
    await expect(
      page.getByRole("heading", { name: question.question }),
    ).toBeVisible();
    const response = page.waitForResponse(
      (r) => r.url().endsWith("/api/quiz") && r.request().method() === "POST",
    );
    if (i === 2)
      await page.getByRole("button", { name: "En tiedä — ohita" }).click();
    else {
      await page
        .getByLabel("Vastauksesi", { exact: true })
        .fill(i === 1 ? "Ei oikea vastaus" : question.answers[0].canonical);
      await page.getByLabel("Vastauksesi", { exact: true }).press("Enter");
    }
    game = await (await response).json();
    await expect(
      page.getByText(game.results[i].canonicalAnswer, { exact: true }),
    ).toBeVisible();
    if (i === 0) {
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.reload();
      await expect(
        page.getByRole("button", { name: "Seuraava kysymys" }),
      ).toBeVisible();
    }
    await page
      .getByRole("button", {
        name: i === initial.length - 1 ? "Katso tuloksesi" : "Seuraava kysymys",
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Hyvin oivallettu." }),
  ).toBeVisible();
  await expect(page.getByText(/5 \/ 7 oikein/)).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copied = text;
        },
      },
      configurable: true,
    });
  });
  await page.getByRole("button", { name: "Jaa tulos" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Tulos kopioitu" }),
  ).toBeVisible();
  const copied = await page.evaluate(
    () => document.documentElement.dataset.copied,
  );
  expect(copied).toContain("5/7 oikein");
  for (const result of game.results)
    expect(copied).not.toContain(result.question);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Hyvin oivallettu." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Aloita päivän visa" }),
  ).toHaveCount(0);
  const other = await context.newPage();
  await other.goto("/");
  await expect(
    other.getByRole("heading", { name: "Hyvin oivallettu." }),
  ).toBeVisible();
  await other.close();
  await page.getByRole("button", { name: "Avaa harjoitus" }).click();
  for (let i = 0; i < initial.length; i++) {
    await page.getByRole("button", { name: "En tiedä — ohita" }).click();
    await page
      .getByRole("button", {
        name: i === initial.length - 1 ? "Katso tuloksesi" : "Seuraava kysymys",
      })
      .click();
  }
  await page.getByRole("button", { name: "Takaisin päivän visaan" }).click();
  await expect(
    page.getByRole("heading", { name: "Hyvin oivallettu." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("network failure preserves input and supports retry", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita päivän visa" }).click();
  await page.getByLabel("Vastauksesi", { exact: true }).fill("Testivastaus");
  await page.route("**/api/quiz", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "Lukitse vastaus" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Vastausta ei saatu tarkistettua" })).toContainText(
    "Vastausta ei saatu tarkistettua",
  );
  await expect(page.getByLabel("Vastauksesi", { exact: true })).toHaveValue(
    "Testivastaus",
  );
  await page.unroute("**/api/quiz");
  await page.getByRole("button", { name: "Lukitse vastaus" }).click();
  await expect(
    page.getByRole("button", { name: "Seuraava kysymys" }),
  ).toBeVisible();
});
test("blocked storage still allows play with a clear persistence notice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita päivän visa" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Selain ei salli tallentamista",
  );
  await page.getByRole("button", { name: "En tiedä — ohita" }).click();
  await expect(
    page.getByRole("button", { name: "Seuraava kysymys" }),
  ).toBeVisible();
});
test("open tab rolls over using the server clock", async ({ page }) => {
  let first = true;
  let tomorrow = "";
  await page.route("**/api/quiz", async (route) => {
    const response = await route.fetch();
    const game = (await response.json()) as QuizResponse;
    if (first) {
      first = false;
      tomorrow = addDays(game.today, 1);
      game.nextRollover = new Date(
        Date.parse(game.serverNow) + 2000,
      ).toISOString();
    } else {
      game.today = tomorrow;
      game.date = tomorrow;
    }
    await route.fulfill({ response, json: game });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita päivän visa" }).click();
  await expect(page.getByRole("status")).toContainText("Päivä vaihtui", {
    timeout: 8000,
  });
  await expect(
    page.getByRole("button", { name: "Aloita päivän visa" }),
  ).toBeEnabled();
  await expect(page.locator("time")).toHaveAttribute("datetime", tomorrow);
});
test("keyboard navigation reaches the answer and next question", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Aloita päivän visa" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#question-heading")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Vastauksesi", { exact: true })).toBeFocused();
  await page.keyboard.type("Testi");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Seuraava kysymys" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Seuraava kysymys" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Vastauksesi", { exact: true })).toHaveValue("");
});
