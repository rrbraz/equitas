import assert from "node:assert/strict";
import test from "node:test";

import {
  formatInputAmount,
  getDistributedAmounts,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../features/expenses/lib/split-calculations.ts";

test("sanitizeCurrencyInput normaliza vírgula e remove caracteres inválidos", () => {
  assert.equal(sanitizeCurrencyInput("R$ 12,34x"), "12.34");
  assert.equal(parseCurrencyInput(".9"), 0.9);
  assert.equal(parseCurrencyInput(",9"), 0.9);
});

test("sanitizeCurrencyInput preserva milhares em formatos pt-BR e en-US", () => {
  assert.equal(sanitizeCurrencyInput("1.234,56"), "1234.56");
  assert.equal(sanitizeCurrencyInput("1,234.56"), "1234.56");
  assert.equal(sanitizeCurrencyInput("1.234"), "1234");
  assert.equal(sanitizeCurrencyInput("12,345"), "12345");
  assert.equal(parseCurrencyInput("R$ 12.345,67"), 12345.67);
});

test("getDistributedAmounts distribui centavos sem perder o total", () => {
  const shares = getDistributedAmounts(10, 3);

  assert.deepEqual(shares, [3.34, 3.33, 3.33]);
  assert.equal(
    shares.reduce((total, share) => total + share, 0).toFixed(2),
    "10.00",
  );
});

test("sanitizeCurrencyInput returns empty string for empty input", () => {
  assert.equal(sanitizeCurrencyInput(""), "");
});

test("sanitizeCurrencyInput returns empty string for non-numeric input", () => {
  assert.equal(sanitizeCurrencyInput("abc"), "");
});

test("getDistributedAmounts returns empty array for zero count", () => {
  assert.deepEqual(getDistributedAmounts(100, 0), []);
});

test("getDistributedAmounts returns zero shares for zero amount", () => {
  const shares = getDistributedAmounts(0, 3);
  assert.deepEqual(shares, [0, 0, 0]);
});

test("getDistributedAmounts handles single participant", () => {
  const shares = getDistributedAmounts(99.99, 1);
  assert.deepEqual(shares, [99.99]);
});

test("getDistributedAmounts handles even split with no remainder", () => {
  const shares = getDistributedAmounts(100, 4);
  assert.deepEqual(shares, [25, 25, 25, 25]);
  assert.equal(
    shares.reduce((total, share) => total + share, 0).toFixed(2),
    "100.00",
  );
});

test("formatInputAmount formats basic values with two decimal places", () => {
  assert.equal(formatInputAmount(10), "10.00");
  assert.equal(formatInputAmount(0), "0.00");
  assert.equal(formatInputAmount(99.999), "100.00");
  assert.equal(formatInputAmount(3.1), "3.10");
});

test("parseCurrencyInput returns 0 for empty string", () => {
  assert.equal(parseCurrencyInput(""), 0);
});
