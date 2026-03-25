import {
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";

export type TestUser = {
  name: string;
  email: string;
  password: string;
};

export function makeTestUser(prefix: string): TestUser {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `${prefix} ${suffix.slice(-6)}`,
    email: `${prefix.toLowerCase().replace(/\s+/g, ".")}.${suffix}@example.com`,
    password: "Senha12345!",
  };
}

export async function createContext(browser: Browser, baseURL: string) {
  const context = await browser.newContext({
    baseURL,
  });

  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: baseURL,
  });

  return context;
}

export async function signUp(page: Page, user: TestUser) {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Senha").fill(user.password);
  await page.getByRole("button", { name: /Criar conta/ }).click();

  await page.waitForURL((url) => !url.pathname.endsWith("/cadastro"));

  if (page.url().includes("/login")) {
    await login(page, user);
    return;
  }

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Seus grupos", exact: true }),
  ).toBeVisible();
}

export async function login(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Senha").fill(user.password);
  await page.getByRole("button", { name: /^Entrar$/ }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: "Seus grupos", exact: true }),
  ).toBeVisible();
}

export async function logout(page: Page) {
  await page.goto("/perfil");
  await page.getByRole("button", { name: /^Sair/ }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function createGroup(
  page: Page,
  input: { name: string; description: string },
) {
  await page.goto("/grupos/criar");
  await page.getByLabel("Nome do grupo").fill(input.name);
  await page.getByLabel("Descrição").fill(input.description);
  await page.getByRole("button", { name: /^Criar grupo$/ }).click();
  await expect(page).toHaveURL(/\/grupos\/.+created=1/);
}

export async function createExpense(
  page: Page,
  input: { amount: string; description: string },
) {
  await page
    .getByRole("link", { name: /Adicionar despesa/, exact: false })
    .first()
    .click();
  await expect(page).toHaveURL(/\/despesas\/nova/);
  await page.getByLabel("Valor da despesa").fill(input.amount);
  await page.getByPlaceholder("No que você gastou?").fill(input.description);
  await page.getByRole("button", { name: /Salvar despesa/ }).click();
  await expect(page).toHaveURL(/expenseSaved=1/);
}

export async function copyInviteLink(page: Page) {
  await page.getByRole("button", { name: /Gerar link interno/ }).click();
  await expect(page.getByText("Link copiado")).toBeVisible();

  return page.evaluate(() => navigator.clipboard.readText());
}

export async function acceptInvite(page: Page, inviteUrl: string) {
  await page.goto(inviteUrl);
  await page.getByRole("button", { name: /Aceitar convite/ }).click();
  await expect(page).toHaveURL(/joined=1/);
}

export async function registerSettlement(page: Page) {
  await page.getByRole("link", { name: /Transferir saldo/ }).click();
  await expect(page).toHaveURL(/\/quitar/);
  await page.getByRole("button", { name: /Registrar transferência/ }).click();
  await expect(page).toHaveURL(/settlementSaved=1/);
}

export async function closeContexts(contexts: BrowserContext[]) {
  await Promise.all(contexts.map((context) => context.close()));
}
