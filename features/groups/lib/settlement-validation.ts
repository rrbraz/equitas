type SettlementValidationInput = {
  payerProfileId: string;
  receiverProfileId: string;
  amount: number;
  payerBalance?: number;
  receiverBalance?: number;
};

type SettlementValidationResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export function validateSettlementInput(
  input: SettlementValidationInput,
): SettlementValidationResult {
  if (!input.payerProfileId || !input.receiverProfileId) {
    return {
      ok: false,
      message: "Selecione quem transfere e quem recebe.",
    };
  }

  if (input.payerProfileId === input.receiverProfileId) {
    return {
      ok: false,
      message: "A transferência precisa acontecer entre membros diferentes.",
    };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return {
      ok: false,
      message: "Informe um valor de transferência válido.",
    };
  }

  if (input.payerBalance === undefined || input.receiverBalance === undefined) {
    return {
      ok: false,
      message: "Os membros selecionados precisam fazer parte deste grupo.",
    };
  }

  if (input.payerBalance >= 0 || input.receiverBalance <= 0) {
    return {
      ok: false,
      message:
        "A transferência só pode sair de quem deve para quem tem saldo a receber.",
    };
  }

  const maxTransferAmount = Math.min(
    Math.abs(input.payerBalance),
    input.receiverBalance,
  );

  if (Math.round(input.amount * 100) > Math.round(maxTransferAmount * 100)) {
    return {
      ok: false,
      message:
        "O valor não pode exceder o saldo pendente entre os dois membros selecionados.",
    };
  }

  return { ok: true };
}
