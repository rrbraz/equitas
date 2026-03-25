"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type RemoveGroupMemberInput = {
  groupId: string;
  groupSlug: string;
  memberProfileId: string;
};

type RemoveGroupMemberResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function removeGroupMember(
  input: RemoveGroupMemberInput,
): Promise<RemoveGroupMemberResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sua sessão expirou. Entre novamente para gerenciar membros.",
    };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("owner_profile_id")
    .eq("id", input.groupId)
    .single<{ owner_profile_id: string }>();

  if (groupError) {
    return {
      ok: false,
      message: "Não foi possível validar as permissões do grupo.",
    };
  }

  if (group.owner_profile_id !== user.id) {
    return {
      ok: false,
      message: "Só o owner pode remover membros neste momento.",
    };
  }

  if (input.memberProfileId === group.owner_profile_id) {
    return {
      ok: false,
      message: "O owner do grupo não pode ser removido.",
    };
  }

  const { data: groupExpenses, error: groupExpensesError } = await supabase
    .from("expenses")
    .select("id")
    .eq("group_id", input.groupId);

  if (groupExpensesError) {
    return {
      ok: false,
      message: "Não foi possível verificar o histórico do grupo.",
    };
  }

  const expenseIds = (groupExpenses ?? []).map((expense) => expense.id);

  const [
    { count: expenseCount, error: expenseError },
    { count: splitCount, error: splitError },
    { count: settlementCount, error: settlementError },
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", input.groupId)
      .or(
        `created_by_profile_id.eq.${input.memberProfileId},paid_by_profile_id.eq.${input.memberProfileId}`,
      ),
    expenseIds.length > 0
      ? supabase
          .from("expense_splits")
          .select("expense_id", { count: "exact", head: true })
          .eq("profile_id", input.memberProfileId)
          .in("expense_id", expenseIds)
      : Promise.resolve({ count: 0, error: null }),
    supabase
      .from("settlements")
      .select("*", { count: "exact", head: true })
      .eq("group_id", input.groupId)
      .or(
        `payer_profile_id.eq.${input.memberProfileId},receiver_profile_id.eq.${input.memberProfileId},created_by_profile_id.eq.${input.memberProfileId}`,
      ),
  ]);

  if (expenseError || splitError || settlementError) {
    return {
      ok: false,
      message: "Não foi possível verificar o histórico do membro.",
    };
  }

  if (
    (expenseCount ?? 0) > 0 ||
    (splitCount ?? 0) > 0 ||
    (settlementCount ?? 0) > 0
  ) {
    return {
      ok: false,
      message:
        "Este membro já tem histórico financeiro no grupo e não pode ser removido.",
    };
  }

  const { error: deleteError } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", input.groupId)
    .eq("profile_id", input.memberProfileId);

  if (deleteError) {
    return {
      ok: false,
      message: "Não foi possível remover o membro agora.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${input.groupSlug}`);

  return {
    ok: true,
    message: "Membro removido com sucesso.",
  };
}
