import assert from "node:assert/strict";
import test from "node:test";

import { validateExpenseInput } from "../features/expenses/lib/expense-validation.ts";
import {
  formatInputAmount,
  getDistributedAmounts,
  parseCurrencyInput,
} from "../features/expenses/lib/split-calculations.ts";

// ---------------------------------------------------------------------------
// formatInputAmount
// ---------------------------------------------------------------------------
// formatInputAmount uses Number.toFixed(2), so the output uses a decimal point
// (en-US style), not a comma separator. The function is an internal input
// formatter that feeds parseCurrencyInput, not a display formatter.

test("formatInputAmount(0) returns zero formatted to two decimal places", () => {
  // Coercion path: string "0" → number 0 behaves the same as passing 0 directly.
  assert.equal(formatInputAmount(0), "0.00");
});

test("formatInputAmount rounds and formats a value with two decimal places", () => {
  // 1234.56 → "1234.56" (no thousands separator — this is an input formatter,
  // not a display formatter; use formatCurrency for pt-BR display).
  assert.equal(formatInputAmount(1234.56), "1234.56");
});

test("formatInputAmount rounds values beyond two decimal places", () => {
  assert.equal(formatInputAmount(9.999), "10.00");
  // Note: 1.005 * 100 = 100.49999999999999 in IEEE 754, so Math.round gives
  // 100, not 101. The result is "1.00", not "1.01". This is expected behaviour.
  assert.equal(formatInputAmount(1.005), "1.00");
});

test("formatInputAmount handles whole numbers without fractional part", () => {
  assert.equal(formatInputAmount(50), "50.00");
  assert.equal(formatInputAmount(1), "1.00");
});

// ---------------------------------------------------------------------------
// parseCurrencyInput — pt-BR formatted strings
// ---------------------------------------------------------------------------

test("parseCurrencyInput('1.234,56') parses pt-BR thousands format to 1234.56", () => {
  assert.equal(parseCurrencyInput("1.234,56"), 1234.56);
});

test("parseCurrencyInput('R$ 100,00') strips currency symbol and parses to 100", () => {
  assert.equal(parseCurrencyInput("R$ 100,00"), 100);
});

test("parseCurrencyInput('R$ 12.345,67') handles large pt-BR amounts", () => {
  assert.equal(parseCurrencyInput("R$ 12.345,67"), 12345.67);
});

test("parseCurrencyInput('0,50') parses sub-unit pt-BR amount", () => {
  assert.equal(parseCurrencyInput("0,50"), 0.5);
});

// ---------------------------------------------------------------------------
// validateExpenseInput — complex split scenarios
// ---------------------------------------------------------------------------

test("validateExpenseInput accepts splits that sum correctly even with duplicate profileIds", () => {
  // The validation does not enforce unique profileIds — it only checks that
  // split amounts are positive and the total matches. Duplicate profileIds are
  // the caller's responsibility to prevent before calling this function.
  const result = validateExpenseInput({
    title: "Aluguel",
    amount: 100,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 50 },
      { profileId: "user-a", amountOwed: 50 }, // duplicate profileId
    ],
  });

  // Validation passes because the arithmetic is correct; deduplication is
  // a concern at the UI/action layer, not the validation layer.
  assert.deepEqual(result, { ok: true });
});

test("validateExpenseInput accepts very large amounts", () => {
  const amount = 999_999.99;
  const result = validateExpenseInput({
    title: "Projeto grande",
    amount,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 499_999.99 },
      { profileId: "user-b", amountOwed: 500_000 },
    ],
  });

  assert.deepEqual(result, { ok: true });
});

test("validateExpenseInput rejects very large amount whose splits do not match", () => {
  const result = validateExpenseInput({
    title: "Projeto imenso",
    amount: 999_999.99,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 499_999.99 },
      { profileId: "user-b", amountOwed: 499_999.99 }, // off by 0.01
    ],
  });

  assert.deepEqual(result, {
    ok: false,
    message: "A divisão precisa fechar exatamente com o valor total.",
  });
});

test("validateExpenseInput accepts a single-participant split equalling the full amount", () => {
  const result = validateExpenseInput({
    title: "Taxi",
    amount: 37.5,
    paidByProfileId: "user-a",
    splits: [{ profileId: "user-a", amountOwed: 37.5 }],
  });

  assert.deepEqual(result, { ok: true });
});

test("validateExpenseInput accepts float amounts that pass cent-level rounding (0.1 + 0.2 scenario)", () => {
  // 0.1 + 0.2 in IEEE 754 is 0.30000000000000004, but the validation uses
  // Math.round(x * 100) on both sides, so 30 === 30 and it passes.
  const result = validateExpenseInput({
    title: "Café",
    amount: 0.3,
    paidByProfileId: "user-a",
    splits: [
      { profileId: "user-a", amountOwed: 0.1 },
      { profileId: "user-b", amountOwed: 0.2 },
    ],
  });

  assert.deepEqual(result, { ok: true });
});

// ---------------------------------------------------------------------------
// getDistributedAmounts — 100-participant penny distribution
// ---------------------------------------------------------------------------

test("getDistributedAmounts distributes correctly across 100 participants", () => {
  // 100 participants, amount does not divide evenly to ensure penny remainder.
  // 100.01 → 10001 cents / 100 → baseShare = 100 cents (1.00), remainder = 1.
  // First 1 share receives 101 cents (1.01); the remaining 99 receive 100 cents (1.00).
  const amount = 100.01;
  const count = 100;
  const shares = getDistributedAmounts(amount, count);

  assert.equal(shares.length, count);

  // The total must equal the original amount exactly (cent-precision sum).
  const total = shares.reduce((acc, s) => acc + s, 0);
  assert.equal(total.toFixed(2), amount.toFixed(2));

  // Compute expected share values using the same cent-level integer arithmetic
  // as the implementation to avoid floating-point surprises.
  const totalCents = Math.round(amount * 100); // 10001
  const baseCents = Math.floor(totalCents / count); // 100
  const remainderCount = totalCents % count; // 1

  const biggerShare = (baseCents + 1) / 100; // 1.01
  const baseShare = baseCents / 100; // 1.00

  // First `remainderCount` shares get the extra penny.
  for (let i = 0; i < remainderCount; i++) {
    assert.equal(shares[i], biggerShare);
  }
  // Remaining shares are at the base amount.
  for (let i = remainderCount; i < count; i++) {
    assert.equal(shares[i], baseShare);
  }
});

test("getDistributedAmounts with 100 participants and even amount has no remainder", () => {
  const amount = 100;
  const count = 100;
  const shares = getDistributedAmounts(amount, count);

  assert.equal(shares.length, count);

  const total = shares.reduce((acc, s) => acc + s, 0);
  assert.equal(total.toFixed(2), "100.00");

  // All shares must be equal when amount divides evenly.
  shares.forEach((share) => assert.equal(share, 1));
});
