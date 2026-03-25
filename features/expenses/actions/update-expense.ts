"use server";

import { revalidatePath } from "next/cache";

import { getExpenseCategorySlug } from "@/features/expenses/lib/expense-categories";
import { validateExpenseInput } from "@/features/expenses/lib/expense-validation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { logServerError } from "@/lib/server/logger";

type ExpenseSplitInput = {
  profileId: string;
  amountOwed: number;
};

type UpdateExpenseInput = {
  expenseId: string;
  groupSlug: string;
  paidByProfileId: string;
  title: string;
  categoryLabel: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  splits: ExpenseSplitInput[];
};

type UpdateExpenseResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function updateExpense(
  input: UpdateExpenseInput,
): Promise<UpdateExpenseResult> {
  const title = input.title.trim();
  const validation = validateExpenseInput({
    title,
    amount: input.amount,
    paidByProfileId: input.paidByProfileId,
    splits: input.splits,
  });

  if (!validation.ok) {
    return validation;
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sua sessão expirou. Entre novamente para editar a despesa.",
    };
  }

  const { error } = await supabase.rpc("update_expense", {
    target_expense_id: input.expenseId,
    target_paid_by_profile_id: input.paidByProfileId,
    expense_title: title,
    expense_category_slug: getExpenseCategorySlug(input.categoryLabel),
    expense_amount: input.amount,
    target_expense_date: input.expenseDate,
    expense_notes: input.notes?.trim() || null,
    expense_splits: input.splits.map((split) => ({
      profile_id: split.profileId,
      amount_owed: split.amountOwed,
    })),
  });

  if (error) {
    logServerError("update_expense_failed", error, {
      expenseId: input.expenseId,
      groupSlug: input.groupSlug,
    });
    return {
      ok: false,
      message: "Não foi possível atualizar a despesa agora.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${input.groupSlug}`);

  return { ok: true };
}
