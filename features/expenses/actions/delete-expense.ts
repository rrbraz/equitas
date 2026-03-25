"use server";

import { revalidatePath } from "next/cache";

import { logServerError } from "@/lib/server/logger";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type DeleteExpenseResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function deleteExpense(
  expenseId: string,
  groupSlug: string,
): Promise<DeleteExpenseResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sua sessão expirou. Entre novamente para excluir a despesa.",
    };
  }

  const { error } = await supabase.rpc("delete_expense", {
    target_expense_id: expenseId,
  });

  if (error) {
    logServerError("delete_expense_failed", error, {
      expenseId,
      groupSlug,
    });
    return {
      ok: false,
      message: "Não foi possível excluir a despesa agora.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${groupSlug}`);

  return { ok: true };
}
