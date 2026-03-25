"use server";

import { revalidatePath } from "next/cache";

import { validateSettlementInput } from "@/features/groups/lib/settlement-validation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { logServerError } from "@/lib/server/logger";

type CreateSettlementInput = {
  groupId: string;
  groupSlug: string;
  payerProfileId: string;
  receiverProfileId: string;
  amount: number;
};

type CreateSettlementResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

type BalanceRow = {
  profile_id: string;
  balance: number;
};

export async function createSettlement(
  input: CreateSettlementInput,
): Promise<CreateSettlementResult> {
  if (!input.payerProfileId || !input.receiverProfileId) {
    return {
      ok: false as const,
      message: "Selecione quem transfere e quem recebe.",
    };
  }

  if (input.payerProfileId === input.receiverProfileId) {
    return {
      ok: false as const,
      message: "A transferência precisa acontecer entre membros diferentes.",
    };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return {
      ok: false as const,
      message: "Informe um valor de transferência válido.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message:
        "Sua sessão expirou. Entre novamente para registrar a transferência.",
    };
  }

  const { data: balances, error: balancesError } = await supabase
    .from("group_balance_snapshot")
    .select("profile_id, balance")
    .eq("group_id", input.groupId)
    .in("profile_id", [input.payerProfileId, input.receiverProfileId]);

  if (balancesError) {
    return {
      ok: false,
      message: "Não foi possível validar os saldos do grupo agora.",
    };
  }

  const balanceByProfileId = new Map<string, number>(
    ((balances ?? []) as BalanceRow[]).map((balanceRow) => [
      balanceRow.profile_id,
      Number(balanceRow.balance),
    ]),
  );

  const payerBalance = balanceByProfileId.get(input.payerProfileId);
  const receiverBalance = balanceByProfileId.get(input.receiverProfileId);
  const validation = validateSettlementInput({
    payerProfileId: input.payerProfileId,
    receiverProfileId: input.receiverProfileId,
    amount: input.amount,
    payerBalance,
    receiverBalance,
  });

  if (!validation.ok) {
    return validation;
  }

  const { error } = await supabase.from("settlements").insert({
    group_id: input.groupId,
    payer_profile_id: input.payerProfileId,
    receiver_profile_id: input.receiverProfileId,
    amount: input.amount,
    created_by_profile_id: user.id,
    created_at: new Date().toISOString(),
  });

  if (error) {
    logServerError("create_settlement_failed", error, {
      groupId: input.groupId,
      groupSlug: input.groupSlug,
    });
    return {
      ok: false,
      message: "Não foi possível registrar a transferência agora.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${input.groupSlug}`);
  revalidatePath(`/grupos/${input.groupSlug}/quitar`);

  return { ok: true };
}
