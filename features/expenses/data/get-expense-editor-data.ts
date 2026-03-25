import "server-only";

import { notFound } from "next/navigation";

import { getExpenseCategoryLabel } from "@/features/expenses/lib/expense-categories";
import { getGroupDetailScreenData } from "@/features/groups/data/get-group-detail-screen-data";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type ExpenseSplitRow = {
  profile_id: string;
  amount_owed: number;
};

export async function getExpenseEditorData(slug: string, expenseId: string) {
  const [groupScreenData, supabase] = await Promise.all([
    getGroupDetailScreenData(slug),
    getSupabaseServerClient(),
  ]);
  const { data: groupRecord, error: groupError } = await supabase
    .from("groups")
    .select("owner_profile_id")
    .eq("id", groupScreenData.group.id)
    .single<{
      owner_profile_id: string;
    }>();

  if (groupError) {
    throw groupError;
  }

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select(
      "id, group_id, created_by_profile_id, paid_by_profile_id, title, category_slug, amount, expense_date, notes",
    )
    .eq("id", expenseId)
    .single<{
      id: string;
      group_id: string;
      created_by_profile_id: string;
      paid_by_profile_id: string;
      title: string;
      category_slug: string;
      amount: number;
      expense_date: string;
      notes: string | null;
    }>();

  if (
    expenseError ||
    !expense ||
    expense.group_id !== groupScreenData.group.id
  ) {
    notFound();
  }

  const canManage =
    expense.created_by_profile_id === groupScreenData.viewer.id ||
    groupRecord.owner_profile_id === groupScreenData.viewer.id;

  if (!canManage) {
    notFound();
  }

  const { data: splits, error: splitsError } = await supabase
    .from("expense_splits")
    .select("profile_id, amount_owed")
    .eq("expense_id", expenseId);

  if (splitsError) {
    throw splitsError;
  }

  return {
    group: groupScreenData.group,
    initialExpense: {
      id: expense.id,
      title: expense.title,
      amount: Number(expense.amount),
      categoryLabel: getExpenseCategoryLabel(expense.category_slug),
      expenseDate: expense.expense_date,
      paidByProfileId: expense.paid_by_profile_id,
      notes: expense.notes ?? "",
      splits: (splits ?? []) as ExpenseSplitRow[],
      canManage,
    },
  };
}
