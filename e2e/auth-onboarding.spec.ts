import { expect, test } from "@playwright/test";

import { createContext, login, logout, makeTestUser, signUp } from "./helpers";

test.describe("auth onboarding", () => {
  test("cadastro, logout e login mantêm a navegação básica funcional", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("Onboarding");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await expect(
      page.getByText("Seu dashboard ainda está em branco"),
    ).toBeVisible();

    await page.goto("/grupos");
    await expect(
      page.getByRole("heading", { name: "Grupos", exact: true }),
    ).toBeVisible();

    await page.goto("/perfil");
    await expect(
      page.getByRole("heading", { name: user.name, exact: true }),
    ).toBeVisible();

    await logout(page);
    await login(page, user);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: "Seus grupos", exact: true }),
    ).toBeVisible();

    await context.close();
  });

  test("rota protegida redireciona para login com next param", async ({
    browser,
    baseURL,
  }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
    const url = new URL(page.url());
    expect(url.searchParams.get("next")).toBeTruthy();
    expect(url.searchParams.get("next")).toContain("/dashboard");

    await context.close();
  });

  test("login com credenciais invalidas mostra erro", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("LoginInvalido");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Senha").fill("SenhaErrada99!");
    await page.getByRole("button", { name: /^Entrar$/ }).click();

    const errorBanner = page
      .getByRole("alert")
      .filter({ hasText: /Não foi possível entrar/i });
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/Invalid login credentials/i);
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });

  test("cadastro com senha curta mostra validação", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("SenhaCurta");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await page.goto("/cadastro");
    await page.getByLabel("Nome completo").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Senha").fill("curta");
    await page.getByRole("button", { name: /Criar conta/ }).click();

    await expect(page.getByText(/pelo menos 8 caracteres/i)).toBeVisible();
    await expect(page).toHaveURL(/\/cadastro/);

    await context.close();
  });
});
