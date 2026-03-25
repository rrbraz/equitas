import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { createContext, makeTestUser, signUp } from "./helpers";

test.describe("accessibility audit", () => {
  // Authenticated pages: create one user and reuse across all page checks.
  // Each test uses a fresh browser context so session is isolated and pages
  // are visited in a clean state, but we sign up only once per suite run
  // (tests share a serial order via fullyParallel: false in config).

  test("dashboard (empty state) has no WCAG 2.0/2.1 A/AA violations", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("A11yDashboard");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Seus grupos", exact: true }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });

  test("/grupos — groups listing has no WCAG 2.0/2.1 A/AA violations", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("A11yGrupos");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/grupos");
    await expect(
      page.getByRole("heading", { name: "Grupos", exact: true }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });

  test("/grupos/criar — create group form has no WCAG 2.0/2.1 A/AA violations", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("A11yCriar");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/grupos/criar");

    // Wait for the form to be interactive before scanning.
    await expect(page.getByLabel("Nome do grupo")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });

  test("/perfil — profile page has no WCAG 2.0/2.1 A/AA violations", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("A11yPerfil");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/perfil");
    await expect(
      page.getByRole("heading", { name: user.name, exact: true }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });

  test("/perfil/editar — edit profile form has no WCAG 2.0/2.1 A/AA violations", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("A11yEditarPerfil");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/perfil/editar");

    // Wait for the form fields to be present before scanning.
    await expect(page.getByLabel("Nome")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });

  test("/relatorios — reports page has no WCAG 2.0/2.1 A/AA violations", async ({
    browser,
    baseURL,
  }) => {
    const user = makeTestUser("A11yRelatorios");
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await signUp(page, user);
    await page.goto("/relatorios");
    await expect(page).toHaveURL(/\/relatorios/);

    // Wait for page content to settle before scanning.
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });

  // Unauthenticated page: no sign-up needed.
  test("/login — login page has no WCAG 2.0/2.1 A/AA violations (unauthenticated)", async ({
    browser,
    baseURL,
  }) => {
    const context = await createContext(browser, baseURL!);
    const page = await context.newPage();

    await page.goto("/login");

    // Wait for the login form to be visible before scanning.
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);

    await context.close();
  });
});
