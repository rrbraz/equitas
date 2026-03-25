import { expect, test } from "@playwright/test";

import {
  createContext,
  createExpense,
  createGroup,
  makeTestUser,
  signUp,
} from "./helpers";

const user = makeTestUser("Grupo");
const groupName = `Viagem E2E ${Date.now()}`;

async function loginUser(
  page: import("@playwright/test").Page,
  u: typeof user,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(u.email);
  await page.getByLabel("Senha").fill(u.password);
  await page.getByRole("button", { name: /^Entrar$/ }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function navigateToGroup(
  page: import("@playwright/test").Page,
  name: string,
) {
  await page.goto("/grupos");
  await page.getByText(name, { exact: true }).click();
  await expect(page).toHaveURL(/\/grupos\/.+/);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}

test.describe.serial("grupo, despesa e relatorios", () => {
  test("cria grupo e verifica detalhe com estado vazio", async ({
    browser,
    baseURL,
  }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await createGroup(page, {
      name: groupName,
      description: "Grupo criado automaticamente pela suite E2E.",
    });

    await expect(
      page.getByRole("heading", { name: groupName, exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Resumo do grupo")).toBeVisible();
    await expect(page.getByText("Sem despesas ainda")).toBeVisible();

    await context.close();
  });

  test("adiciona despesa e verifica na lista do grupo", async ({
    browser,
    baseURL,
  }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await loginUser(page, user);
    await navigateToGroup(page, groupName);

    await createExpense(page, {
      amount: "100",
      description: "Jantar E2E",
    });

    await expect(page).toHaveURL(/expenseSaved=1/);
    await expect(page.getByText("Jantar E2E")).toBeVisible();
    await expect(
      page.locator(".list-card__value").getByText(/R\$\s*100/),
    ).toBeVisible();

    await context.close();
  });

  test("edita despesa existente", async ({ browser, baseURL }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await loginUser(page, user);
    await navigateToGroup(page, groupName);

    await createExpense(page, {
      amount: "50",
      description: "Despesa para editar E2E",
    });
    await expect(page.getByText("Despesa para editar E2E")).toBeVisible();

    await page.getByRole("link", { name: "Editar despesa" }).first().click();
    await expect(page).toHaveURL(/\/despesas\/.+\/editar/);

    const descriptionInput = page.getByPlaceholder("No que você gastou?");
    await descriptionInput.clear();
    await descriptionInput.fill("Jantar Editado E2E");

    await page.getByRole("button", { name: /Salvar alteração/ }).click();
    await expect(page).toHaveURL(/expenseUpdated=1/);
    await expect(page.getByText("Jantar Editado E2E")).toBeVisible();

    await context.close();
  });

  test("exclui despesa", async ({ browser, baseURL }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await loginUser(page, user);
    await navigateToGroup(page, groupName);

    await createExpense(page, {
      amount: "75",
      description: "Despesa para excluir E2E",
    });
    await expect(page.getByText("Despesa para excluir E2E")).toBeVisible();

    await page.getByRole("link", { name: "Editar despesa" }).first().click();
    await expect(page).toHaveURL(/\/despesas\/.+\/editar/);

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /Excluir despesa/ }).click();

    await expect(page).toHaveURL(/expenseDeleted=1/);
    await expect(page.getByText("Despesa para excluir E2E")).not.toBeVisible();

    await context.close();
  });

  test("relatorios mostram despesa do grupo", async ({ browser, baseURL }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await loginUser(page, user);
    await navigateToGroup(page, groupName);

    const expenseTitle = `Relatorio E2E ${Date.now()}`;
    await createExpense(page, {
      amount: "200",
      description: expenseTitle,
    });
    await expect(page.getByText(expenseTitle)).toBeVisible();

    await page.getByRole("link", { name: /Ver relatórios/ }).click();
    await expect(page).toHaveURL(/\/relatorios/);

    await expect(
      page.getByRole("heading", { name: "Histórico global", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(expenseTitle)).toBeVisible();

    await context.close();
  });

  test("grupo aparece na listagem /grupos", async ({ browser, baseURL }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await loginUser(page, user);
    await page.goto("/grupos");

    await expect(
      page.getByRole("heading", { name: "Grupos", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(groupName, { exact: true })).toBeVisible();

    await context.close();
  });
});
