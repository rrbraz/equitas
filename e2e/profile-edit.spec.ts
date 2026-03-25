import { expect, test } from "@playwright/test";

import { createContext, makeTestUser, signUp } from "./helpers";

test.describe("profile edit", () => {
  test("perfil permite editar dados basicos do usuario autenticado", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("Perfil");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();
    const updatedName = `${user.name} Editado`;
    const updatedCity = "Sao Paulo";

    await signUp(page, user);
    await page.goto("/perfil/editar");
    await page.getByLabel("Nome").fill(updatedName);
    await page.getByLabel("Cidade").fill(updatedCity);
    await page.getByRole("button", { name: /Salvar perfil/ }).click();

    await expect(page).toHaveURL(/\/perfil\?updated=1/);
    await expect(
      page.getByRole("heading", { name: updatedName, exact: true }),
    ).toBeVisible();
    await expect(page.getByText(updatedCity)).toBeVisible();

    await context.close();
  });

  test("troca de senha com confirmação divergente mostra erro", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("TrocaSenha");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/perfil/seguranca");

    await page.getByLabel("Nova senha", { exact: true }).fill("NovaSenha123!");
    await page
      .getByLabel("Confirmar nova senha", { exact: true })
      .fill("SenhaDiferente456!");
    await page.getByRole("button", { name: /Atualizar senha/ }).click();

    const errorBanner = page
      .getByRole("alert")
      .filter({ hasText: /Não foi possível atualizar a senha/i });
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(
      /confirmação precisa bater com a nova senha/i,
    );
    await expect(page).toHaveURL(/\/perfil\/seguranca/);

    await context.close();
  });

  test("troca de senha valida redireciona com feedback", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("TrocaSenhaValida");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();
    const newPassword = "NovaSenha789!";

    await signUp(page, user);
    await page.goto("/perfil/seguranca");

    await page.getByLabel("Nova senha", { exact: true }).fill(newPassword);
    await page
      .getByLabel("Confirmar nova senha", { exact: true })
      .fill(newPassword);
    await page.getByRole("button", { name: /Atualizar senha/ }).click();

    await expect(page).toHaveURL(/\/perfil\?passwordUpdated=1/);

    await context.close();
  });

  test("navegação do bottom nav funciona entre areas", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("NavegacaoNav");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);

    await page.getByRole("link", { name: "Grupos", exact: true }).click();
    await expect(page).toHaveURL(/\/grupos/);
    await expect(
      page.getByRole("heading", { name: "Grupos", exact: true }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Relatórios", exact: true }).click();
    await expect(page).toHaveURL(/\/relatorios/);

    await page.getByRole("link", { name: "Perfil", exact: true }).click();
    await expect(page).toHaveURL(/\/perfil/);
    await expect(
      page.getByRole("heading", { name: user.name, exact: true }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Seus grupos", exact: true }),
    ).toBeVisible();

    await context.close();
  });
});
