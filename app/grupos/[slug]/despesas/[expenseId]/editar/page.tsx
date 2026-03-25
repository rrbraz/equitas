import { ExpenseComposer } from "@/features/expenses/components/expense-composer";
import { getExpenseEditorData } from "@/features/expenses/data/get-expense-editor-data";

export const dynamic = "force-dynamic";

export default async function EditarDespesaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; expenseId: string }>;
  searchParams: Promise<{
    created?: string;
    joined?: string;
    inviteCount?: string;
    inviteWarning?: string;
  }>;
}) {
  const { slug, expenseId } = await params;
  const query = await searchParams;
  const screenData = await getExpenseEditorData(slug, expenseId);
  const groupQuery = new URLSearchParams();

  if (query.created === "1") {
    groupQuery.set("created", "1");
  }
  if (query.joined === "1") {
    groupQuery.set("joined", "1");
  }
  if (query.inviteCount) {
    groupQuery.set("inviteCount", query.inviteCount);
  }
  if (query.inviteWarning === "1") {
    groupQuery.set("inviteWarning", "1");
  }

  return (
    <ExpenseComposer
      {...screenData}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
