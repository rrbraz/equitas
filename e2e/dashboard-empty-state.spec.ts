import { expect, test } from "@playwright/test";

import { createContext, createGroup, makeTestUser, signUp } from "./helpers";

test.describe("dashboard empty state e grupos", () => {
  test("dashboard vazio para usuario novo", async ({ browser, baseURL }) => {
    const user = makeTestUser("DashEmpty");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByText("Seu dashboard ainda está em branco"),
    ).toBeVisible();
    await expect(
      page
        .getByRole("main")
        .getByRole("link", { name: "Criar primeiro grupo" })
        .first(),
    ).toBeVisible();

    await context.close();
  });

  test("dashboard mostra grupo apos criacao", async ({ browser, baseURL }) => {
    const user = makeTestUser("DashGrupo");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();
    const groupName = `Grupo Dashboard ${Date.now()}`;

    await signUp(page, user);
    await createGroup(page, {
      name: groupName,
      description: "Grupo criado para validar dashboard E2E.",
    });

    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: "Seus grupos", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(groupName, { exact: true })).toBeVisible();

    await context.close();
  });
});
