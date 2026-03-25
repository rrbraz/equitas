type ExpenseSplitInput = {
  profileId: string;
  amountOwed: number;
};

type ExpenseValidationInput = {
  title: string;
  amount: number;
  paidByProfileId: string;
  splits: ExpenseSplitInput[];
};

type ExpenseValidationResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export function validateExpenseInput(
  input: ExpenseValidationInput,
): ExpenseValidationResult {
  if (input.title.trim().length < 2) {
    return {
      ok: false,
      message: "Descreva a despesa com pelo menos 2 caracteres.",
    };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return {
      ok: false,
      message: "Informe um valor válido maior que zero.",
    };
  }

  if (!input.paidByProfileId) {
    return {
      ok: false,
      message: "Selecione um pagador válido.",
    };
  }

  if (input.splits.length === 0) {
    return {
      ok: false,
      message: "Escolha ao menos um participante para dividir a despesa.",
    };
  }

  if (
    input.splits.some(
      (split) =>
        !split.profileId ||
        !Number.isFinite(split.amountOwed) ||
        split.amountOwed <= 0,
    )
  ) {
    return {
      ok: false,
      message: "As cotas da despesa precisam ser válidas e positivas.",
    };
  }

  const totalSplit = input.splits.reduce(
    (total, split) => total + split.amountOwed,
    0,
  );

  if (Math.round(totalSplit * 100) !== Math.round(input.amount * 100)) {
    return {
      ok: false,
      message: "A divisão precisa fechar exatamente com o valor total.",
    };
  }

  return { ok: true };
}
