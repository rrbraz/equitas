import assert from "node:assert/strict";
import test from "node:test";

import { validateExpenseInput } from "../features/expenses/lib/expense-validation.ts";

test("validateExpenseInput rejeita split inconsistente", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 90,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 30 },
      { profileId: "user-b", amountOwed: 20 },
    ],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "A divisão precisa fechar exatamente com o valor total.",
  });
});

test("validateExpenseInput aceita despesa válida", () => {
  const result = validateExpenseInput({
    title: "Mercado",
    amount: 120,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 40 },
      { profileId: "user-b", amountOwed: 40 },
      { profileId: "user-c", amountOwed: 40 },
    ],
  });

  assert.deepEqual(result, { ok: true });
});

test("validateExpenseInput rejects title shorter than 2 characters", () => {
  const result = validateExpenseInput({
    title: "A",
    amount: 50,
    paidByProfileId: "user-a",
    splits: [{ profileId: "user-a", amountOwed: 50 }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Descreva a despesa com pelo menos 2 caracteres.",
  });
});

test("validateExpenseInput rejects whitespace-only title", () => {
  const result = validateExpenseInput({
    title: "   ",
    amount: 50,
    paidByProfileId: "user-a",
    splits: [{ profileId: "user-a", amountOwed: 50 }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Descreva a despesa com pelo menos 2 caracteres.",
  });
});

test("validateExpenseInput rejects amount less than or equal to zero", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 0,
    paidByProfileId: "user-a",
    splits: [{ profileId: "user-a", amountOwed: 0 }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Informe um valor válido maior que zero.",
  });
});

test("validateExpenseInput rejects NaN amount", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: NaN,
    paidByProfileId: "user-a",
    splits: [{ profileId: "user-a", amountOwed: 50 }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Informe um valor válido maior que zero.",
  });
});

test("validateExpenseInput rejects missing paidByProfileId", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 50,
    paidByProfileId: "",
    splits: [{ profileId: "user-a", amountOwed: 50 }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Selecione um pagador válido.",
  });
});

test("validateExpenseInput rejects empty splits array", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 50,
    paidByProfileId: "user-a",
    splits: [],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Escolha ao menos um participante para dividir a despesa.",
  });
});

test("validateExpenseInput rejects split with missing profileId", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 50,
    paidByProfileId: "user-a",
    splits: [{ profileId: "", amountOwed: 50 }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "As cotas da despesa precisam ser válidas e positivas.",
  });
});

test("validateExpenseInput rejects split with amountOwed <= 0", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 50,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 0 },
      { profileId: "user-b", amountOwed: 50 },
    ],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "As cotas da despesa precisam ser válidas e positivas.",
  });
});

test("validateExpenseInput rejects split with NaN amountOwed", () => {
  const result = validateExpenseInput({
    title: "Jantar",
    amount: 50,
    paidByProfileId: "user-a",
    splits: [{ profileId: "user-a", amountOwed: NaN }],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "As cotas da despesa precisam ser válidas e positivas.",
  });
});
