import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCurrency,
  formatSignedCurrency,
  formatPercent,
} from "../lib/format.ts";

// --- formatCurrency ---

test("formatCurrency formats basic BRL value", () => {
  const result = formatCurrency(42.5);
  assert.match(result, /42,50/);
  assert.match(result, /R\$/);
});

test("formatCurrency formats zero as BRL", () => {
  const result = formatCurrency(0);
  assert.match(result, /0,00/);
  assert.match(result, /R\$/);
});

test("formatCurrency formats negative value", () => {
  const result = formatCurrency(-15.99);
  assert.match(result, /15,99/);
});

test("formatCurrency formats large number with thousands grouping", () => {
  const result = formatCurrency(12345.67);
  assert.match(result, /12/);
  assert.match(result, /345,67/);
});

// --- formatSignedCurrency ---

test("formatSignedCurrency prefixes positive value with +", () => {
  const result = formatSignedCurrency(25);
  assert.match(result, /^\+/);
  assert.match(result, /25,00/);
});

test("formatSignedCurrency prefixes negative value with -", () => {
  const result = formatSignedCurrency(-10);
  assert.match(result, /^-/);
  assert.match(result, /10,00/);
});

test("formatSignedCurrency shows zero without sign prefix", () => {
  const result = formatSignedCurrency(0);
  assert.doesNotMatch(result, /^\+/);
  assert.doesNotMatch(result, /^-/);
  assert.match(result, /0,00/);
});

// --- formatPercent ---

test("formatPercent formats normal values", () => {
  assert.equal(formatPercent(42.56), "42.6%");
  assert.equal(formatPercent(100), "100.0%");
  assert.equal(formatPercent(0.1), "0.1%");
});

test("formatPercent formats zero", () => {
  assert.equal(formatPercent(0), "0.0%");
});

test("formatPercent returns 0.0% for NaN", () => {
  assert.equal(formatPercent(NaN), "0.0%");
});

test("formatPercent returns 0.0% for Infinity", () => {
  assert.equal(formatPercent(Infinity), "0.0%");
  assert.equal(formatPercent(-Infinity), "0.0%");
});
