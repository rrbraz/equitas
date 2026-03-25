import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateBalancesFromLedger,
  getPendingSettlementTotal,
} from "../features/groups/lib/balance-snapshot.ts";

test("calculateBalancesFromLedger returns zero balances for empty expenses and settlements", () => {
  const balances = calculateBalancesFromLedger(["ana", "bia"], [], []);

  assert.equal(balances.get("ana"), 0);
  assert.equal(balances.get("bia"), 0);
});

test("calculateBalancesFromLedger handles only settlements without expenses", () => {
  const balances = calculateBalancesFromLedger(
    ["ana", "bia"],
    [],
    [{ payerProfileId: "bia", receiverProfileId: "ana", amount: 50 }],
  );

  assert.equal(balances.get("bia"), 50);
  assert.equal(balances.get("ana"), -50);
});

test("calculateBalancesFromLedger handles single expense with two members", () => {
  const balances = calculateBalancesFromLedger(
    ["ana", "bia"],
    [
      {
        paidByProfileId: "ana",
        amount: 100,
        splits: [
          { profileId: "ana", amountOwed: 50 },
          { profileId: "bia", amountOwed: 50 },
        ],
      },
    ],
    [],
  );

  assert.equal(balances.get("ana"), 50);
  assert.equal(balances.get("bia"), -50);
});

test("getPendingSettlementTotal returns zero for empty array", () => {
  assert.equal(getPendingSettlementTotal([]), 0);
});

test("getPendingSettlementTotal returns zero when all balances are negative", () => {
  assert.equal(getPendingSettlementTotal([-30, -20, -10]), 0);
});

test("getPendingSettlementTotal sums only positive balances", () => {
  assert.equal(getPendingSettlementTotal([50, -30, -20]), 50);
  assert.equal(getPendingSettlementTotal([80, -10, -70]), 80);
});

test("getPendingSettlementTotal returns zero when all balances are zero", () => {
  assert.equal(getPendingSettlementTotal([0, 0, 0]), 0);
});
