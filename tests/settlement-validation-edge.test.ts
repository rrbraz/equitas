import assert from "node:assert/strict";
import test from "node:test";

import { validateSettlementInput } from "../features/groups/lib/settlement-validation.ts";

// ---------------------------------------------------------------------------
// Edge cases: very small amounts
// ---------------------------------------------------------------------------

test("validateSettlementInput accepts the minimum meaningful amount of 0.01", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 0.01,
    payerBalance: -0.01,
    receiverBalance: 0.01,
  });

  assert.deepEqual(result, { ok: true });
});

test("validateSettlementInput rejects amount of 0 (not greater than zero)", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 0,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Informe um valor de transferência válido.",
  });
});

test("validateSettlementInput rejects negative transfer amount", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: -5,
    payerBalance: -50,
    receiverBalance: 50,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Informe um valor de transferência válido.",
  });
});

// ---------------------------------------------------------------------------
// Edge cases: exact boundary — payerBalance = -50, amount = 50
// ---------------------------------------------------------------------------

test("validateSettlementInput accepts amount exactly equal to the absolute payerBalance", () => {
  // payerBalance = -50, receiverBalance = 50, amount = 50
  // maxTransferAmount = min(|-50|, 50) = 50 → amount (50) <= 50 → OK
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 50,
    payerBalance: -50,
    receiverBalance: 50,
  });

  assert.deepEqual(result, { ok: true });
});

test("validateSettlementInput rejects amount one cent above the exact payerBalance boundary", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 50.01,
    payerBalance: -50,
    receiverBalance: 100,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "O valor não pode exceder o saldo pendente entre os dois membros selecionados.",
  });
});

test("validateSettlementInput accepts amount exactly equal to receiverBalance when it is the limiting factor", () => {
  // payerBalance = -100, receiverBalance = 30
  // maxTransferAmount = min(100, 30) = 30 → amount (30) <= 30 → OK
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 30,
    payerBalance: -100,
    receiverBalance: 30,
  });

  assert.deepEqual(result, { ok: true });
});

test("validateSettlementInput rejects amount above receiverBalance when it is the limiting factor", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 30.01,
    payerBalance: -100,
    receiverBalance: 30,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "O valor não pode exceder o saldo pendente entre os dois membros selecionados.",
  });
});

// ---------------------------------------------------------------------------
// Edge cases: floating-point arithmetic (0.1 + 0.2 scenario)
// ---------------------------------------------------------------------------

test("validateSettlementInput uses cent-level rounding so 0.1+0.2 imprecision does not cause false rejection", () => {
  // 0.1 + 0.2 in IEEE 754 = 0.30000000000000004
  // maxTransferAmount = min(0.3, 0.3) = 0.3
  // Math.round(0.30000000000000004 * 100) = 30
  // Math.round(0.3 * 100) = 30 → 30 <= 30 → OK
  const floatingPointAmount = 0.1 + 0.2; // 0.30000000000000004

  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: floatingPointAmount,
    payerBalance: -0.3,
    receiverBalance: 0.3,
  });

  assert.deepEqual(result, { ok: true });
});

test("validateSettlementInput rejects when floating-point amount exceeds the max by at least one cent", () => {
  // Even with floating-point arithmetic, an amount that is truly greater by
  // one cent should be rejected.
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 0.31,
    payerBalance: -0.3,
    receiverBalance: 0.3,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "O valor não pode exceder o saldo pendente entre os dois membros selecionados.",
  });
});

// ---------------------------------------------------------------------------
// Edge cases: balance direction guards
// ---------------------------------------------------------------------------

test("validateSettlementInput rejects when payerBalance is zero (not negative)", () => {
  // payerBalance >= 0 means this user does not owe anything.
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 10,
    payerBalance: 0,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "A transferência só pode sair de quem deve para quem tem saldo a receber.",
  });
});

test("validateSettlementInput rejects when receiverBalance is zero (not positive)", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 10,
    payerBalance: -10,
    receiverBalance: 0,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "A transferência só pode sair de quem deve para quem tem saldo a receber.",
  });
});

test("validateSettlementInput rejects when payerProfileId equals receiverProfileId", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-a",
    amount: 10,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "A transferência precisa acontecer entre membros diferentes.",
  });
});

test("validateSettlementInput rejects when balances are not provided", () => {
  const result = validateSettlementInput({
    payerProfileId: "user-a",
    receiverProfileId: "user-b",
    amount: 10,
    // payerBalance and receiverBalance omitted
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Os membros selecionados precisam fazer parte deste grupo.",
  });
});
