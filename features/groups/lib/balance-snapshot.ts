type LedgerExpense = {
  paidByProfileId: string;
  amount: number;
  splits: Array<{
    profileId: string;
    amountOwed: number;
  }>;
};

type LedgerSettlement = {
  payerProfileId: string;
  receiverProfileId: string;
  amount: number;
};

export function calculateBalancesFromLedger(
  profileIds: string[],
  expenses: LedgerExpense[],
  settlements: LedgerSettlement[],
) {
  const balances = new Map<string, number>(
    profileIds.map((profileId) => [profileId, 0]),
  );

  expenses.forEach((expense) => {
    balances.set(
      expense.paidByProfileId,
      (balances.get(expense.paidByProfileId) ?? 0) + expense.amount,
    );

    expense.splits.forEach((split) => {
      balances.set(
        split.profileId,
        (balances.get(split.profileId) ?? 0) - split.amountOwed,
      );
    });
  });

  settlements.forEach((settlement) => {
    balances.set(
      settlement.payerProfileId,
      (balances.get(settlement.payerProfileId) ?? 0) + settlement.amount,
    );
    balances.set(
      settlement.receiverProfileId,
      (balances.get(settlement.receiverProfileId) ?? 0) - settlement.amount,
    );
  });

  return balances;
}

export function getPendingSettlementTotal(balances: number[]) {
  return balances.reduce(
    (total, balance) => total + (balance > 0 ? balance : 0),
    0,
  );
}
