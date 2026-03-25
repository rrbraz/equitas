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

type CreateExpenseInput = {
  groupId: string;
  groupSlug: string;
  paidByProfileId: string;
  title: string;
  categoryLabel: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  splits: ExpenseSplitInput[];
};

type CreateExpenseResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function createExpense(
  input: CreateExpenseInput,
): Promise<CreateExpenseResult> {
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
      message: "Sua sessão expirou. Entre novamente para salvar a despesa.",
    };
  }

  const { error } = await supabase.rpc("create_expense", {
    target_group_id: input.groupId,
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
    logServerError("create_expense_failed", error, {
      groupId: input.groupId,
      groupSlug: input.groupSlug,
    });
    return {
      ok: false,
      message: "Não foi possível salvar a despesa agora.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${input.groupSlug}`);
  revalidatePath(`/grupos/${input.groupSlug}/despesas/nova`);

  return { ok: true };
}
