import assert from "node:assert/strict";
import test from "node:test";

import { getSafeNextPath } from "../features/auth/lib/get-safe-next-path.ts";

test("getSafeNextPath returns fallback for null", () => {
  assert.equal(getSafeNextPath(null), "/dashboard");
});

test("getSafeNextPath returns fallback for undefined", () => {
  assert.equal(getSafeNextPath(undefined), "/dashboard");
});

test("getSafeNextPath returns fallback for empty string", () => {
  assert.equal(getSafeNextPath(""), "/dashboard");
});

test("getSafeNextPath returns fallback for path not starting with /", () => {
  assert.equal(getSafeNextPath("dashboard"), "/dashboard");
  assert.equal(getSafeNextPath("http://evil.com"), "/dashboard");
});

test("getSafeNextPath returns fallback for protocol-relative URL attack (//)", () => {
  assert.equal(getSafeNextPath("//evil.com"), "/dashboard");
});

test("getSafeNextPath returns fallback for path containing backslash", () => {
  assert.equal(getSafeNextPath("/foo\\bar"), "/dashboard");
  assert.equal(getSafeNextPath("\\evil"), "/dashboard");
});

test("getSafeNextPath returns the candidate for valid absolute paths", () => {
  assert.equal(getSafeNextPath("/dashboard"), "/dashboard");
  assert.equal(getSafeNextPath("/grupos"), "/grupos");
  assert.equal(getSafeNextPath("/perfil/editar"), "/perfil/editar");
});

test("getSafeNextPath returns the candidate for paths with query strings", () => {
  assert.equal(getSafeNextPath("/grupos?created=1"), "/grupos?created=1");
  assert.equal(
    getSafeNextPath("/dashboard?tab=resumo"),
    "/dashboard?tab=resumo",
  );
});

test("getSafeNextPath uses custom fallback when provided", () => {
  assert.equal(getSafeNextPath(null, "/grupos"), "/grupos");
  assert.equal(getSafeNextPath("", "/perfil"), "/perfil");
  assert.equal(getSafeNextPath("bad-path", "/menu"), "/menu");
});
