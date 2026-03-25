import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateBalancesFromLedger,
  getPendingSettlementTotal,
} from "../features/groups/lib/balance-snapshot.ts";
import { validateSettlementInput } from "../features/groups/lib/settlement-validation.ts";

test("ledger crítico com despesa e settlement recalcula saldo ponta a ponta", () => {
  const balancesBeforeSettlement = calculateBalancesFromLedger(
    ["ana", "bia", "caio"],
    [
      {
        paidByProfileId: "ana",
        amount: 150,
        splits: [
          { profileId: "ana", amountOwed: 50 },
          { profileId: "bia", amountOwed: 50 },
          { profileId: "caio", amountOwed: 50 },
        ],
      },
      {
        paidByProfileId: "bia",
        amount: 60,
        splits: [
          { profileId: "ana", amountOwed: 20 },
          { profileId: "bia", amountOwed: 20 },
          { profileId: "caio", amountOwed: 20 },
        ],
      },
    ],
    [],
  );

  assert.equal(balancesBeforeSettlement.get("ana"), 80);
  assert.equal(balancesBeforeSettlement.get("bia"), -10);
  assert.equal(balancesBeforeSettlement.get("caio"), -70);
  assert.equal(
    getPendingSettlementTotal(Array.from(balancesBeforeSettlement.values())),
    80,
  );

  const balancesAfterSettlement = calculateBalancesFromLedger(
    ["ana", "bia", "caio"],
    [
      {
        paidByProfileId: "ana",
        amount: 150,
        splits: [
          { profileId: "ana", amountOwed: 50 },
          { profileId: "bia", amountOwed: 50 },
          { profileId: "caio", amountOwed: 50 },
        ],
      },
      {
        paidByProfileId: "bia",
        amount: 60,
        splits: [
          { profileId: "ana", amountOwed: 20 },
          { profileId: "bia", amountOwed: 20 },
          { profileId: "caio", amountOwed: 20 },
        ],
      },
    ],
    [
      {
        payerProfileId: "caio",
        receiverProfileId: "ana",
        amount: 70,
      },
      {
        payerProfileId: "bia",
        receiverProfileId: "ana",
        amount: 10,
      },
    ],
  );

  assert.equal(balancesAfterSettlement.get("ana"), 0);
  assert.equal(balancesAfterSettlement.get("bia"), 0);
  assert.equal(balancesAfterSettlement.get("caio"), 0);
  assert.equal(
    getPendingSettlementTotal(Array.from(balancesAfterSettlement.values())),
    0,
  );
});

test("validateSettlementInput bloqueia transferência acima do saldo pendente", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
    amount: 40,
    payerBalance: -10,
    receiverBalance: 25,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "O valor não pode exceder o saldo pendente entre os dois membros selecionados.",
  });
});

test("validateSettlementInput rejects missing payer profile ID", () => {
  const result = validateSettlementInput({
    payerProfileId: "",
    receiverProfileId: "ana",
    amount: 10,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Selecione quem transfere e quem recebe.",
  });
});

test("validateSettlementInput rejects missing receiver profile ID", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "",
    amount: 10,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Selecione quem transfere e quem recebe.",
  });
});

test("validateSettlementInput rejects same payer and receiver", () => {
  const result = validateSettlementInput({
    payerProfileId: "ana",
    receiverProfileId: "ana",
    amount: 10,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "A transferência precisa acontecer entre membros diferentes.",
  });
});

test("validateSettlementInput rejects non-positive amount", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
    amount: 0,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Informe um valor de transferência válido.",
  });
});

test("validateSettlementInput rejects NaN amount", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
    amount: NaN,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Informe um valor de transferência válido.",
  });
});

test("validateSettlementInput rejects undefined balances", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
    amount: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message: "Os membros selecionados precisam fazer parte deste grupo.",
  });
});

test("validateSettlementInput rejects payer with positive balance (does not owe)", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
    amount: 10,
    payerBalance: 5,
    receiverBalance: 10,
  });

  assert.deepEqual(result, {
    ok: false,
    message:
      "A transferência só pode sair de quem deve para quem tem saldo a receber.",
  });
});

test("validateSettlementInput rejects receiver with non-positive balance", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
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

test("validateSettlementInput accepts valid settlement", () => {
  const result = validateSettlementInput({
    payerProfileId: "bia",
    receiverProfileId: "ana",
    amount: 10,
    payerBalance: -10,
    receiverBalance: 10,
  });

  assert.deepEqual(result, { ok: true });
});
