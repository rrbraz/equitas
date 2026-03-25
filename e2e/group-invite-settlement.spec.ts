import { expect, test } from "@playwright/test";

import {
  acceptInvite,
  closeContexts,
  copyInviteLink,
  createContext,
  createExpense,
  createGroup,
  makeTestUser,
  registerSettlement,
  signUp,
} from "./helpers";

const owner = makeTestUser("Owner");
const guest = makeTestUser("Guest");
const groupName = `Viagem E2E ${Date.now()}`;
let inviteUrl = "";
let groupUrl = "";

test.describe.serial("convite e settlement entre usuarios", () => {
  test("owner cria grupo e convida guest por email", async ({
    browser,
    baseURL,
  }) => {
    const ownerContext = await createContext(browser, baseURL!);
    const ownerPage = await ownerContext.newPage();

    await signUp(ownerPage, owner);
    await createGroup(ownerPage, {
      name: groupName,
      description: "Grupo criado automaticamente pela suite E2E.",
    });

    groupUrl = ownerPage.url().split("?")[0];

    await expect(
      ownerPage.getByRole("heading", {
        name: "Convites pendentes",
        exact: true,
      }),
    ).toBeVisible();

    await ownerPage.getByPlaceholder("email@exemplo.com").fill(guest.email);
    await ownerPage.getByRole("button", { name: /Convidar por email/ }).click();
    await expect(ownerPage.getByText("Convite criado")).toBeVisible();

    await ownerContext.close();
  });

  test("owner gera link de convite e guest aceita", async ({
    browser,
    baseURL,
  }) => {
    const ownerContext = await createContext(browser, baseURL!);
    const guestContext = await createContext(browser, baseURL!);
    const ownerPage = await ownerContext.newPage();
    const guestPage = await guestContext.newPage();

    // Owner logs back in and navigates to the group
    const { login } = await import("./helpers");
    await login(ownerPage, owner);
    await ownerPage.goto(groupUrl);

    inviteUrl = await copyInviteLink(ownerPage);
    expect(inviteUrl).toContain("/convites/");

    // Guest signs up and accepts invite
    await signUp(guestPage, guest);
    await acceptInvite(guestPage, inviteUrl);

    await expect(
      guestPage.getByRole("heading", {
        name: "Saldos por membro",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      guestPage.getByText(owner.name, { exact: true }),
    ).toBeVisible();

    await closeContexts([ownerContext, guestContext]);
  });

  test("owner adiciona despesa e guest ve no grupo", async ({
    browser,
    baseURL,
  }) => {
    const ownerContext = await createContext(browser, baseURL!);
    const guestContext = await createContext(browser, baseURL!);
    const ownerPage = await ownerContext.newPage();
    const guestPage = await guestContext.newPage();

    const { login } = await import("./helpers");
    await login(ownerPage, owner);
    await ownerPage.goto(groupUrl);

    await createExpense(ownerPage, {
      amount: "100",
      description: "Jantar de validacao E2E",
    });
    await expect(ownerPage.getByText("Jantar de validacao E2E")).toBeVisible();

    // Guest navigates to the same group and sees the expense
    await login(guestPage, guest);
    await guestPage.goto(groupUrl);
    await expect(guestPage.getByText("Jantar de validacao E2E")).toBeVisible();

    // Save the group URL for later tests (without query params)
    groupUrl = ownerPage.url().split("?")[0];

    await closeContexts([ownerContext, guestContext]);
  });

  test("guest registra settlement", async ({ browser, baseURL }) => {
    const guestContext = await createContext(browser, baseURL!);
    const guestPage = await guestContext.newPage();

    const { login } = await import("./helpers");
    await login(guestPage, guest);
    await guestPage.goto(groupUrl);

    await registerSettlement(guestPage);

    await expect(guestPage).toHaveURL(/settlementSaved=1/);
    await expect(
      guestPage.getByRole("heading", {
        name: "Transferências registradas",
        exact: true,
      }),
    ).toBeVisible();

    await guestContext.close();
  });

  test("dashboard do owner reflete grupo e saldo", async ({
    browser,
    baseURL,
  }) => {
    const ownerContext = await createContext(browser, baseURL!);
    const ownerPage = await ownerContext.newPage();

    const { login } = await import("./helpers");
    await login(ownerPage, owner);
    await ownerPage.goto("/dashboard");

    await expect(
      ownerPage.getByRole("heading", { name: "Seus grupos", exact: true }),
    ).toBeVisible();
    await expect(ownerPage.getByText(groupName, { exact: true })).toBeVisible();

    // Balance info visible (either "Devem para você" or "Você deve" cards)
    await expect(ownerPage.getByText("Devem para você")).toBeVisible();

    await ownerContext.close();
  });
});
