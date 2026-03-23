import { notFound } from "next/navigation";

import { ExpenseComposer } from "@/features/expenses/components/expense-composer";
import { getMockExpenseComposerData } from "@/features/expenses/data/mock-expense-composer";

export default async function NovaDespesaDoGrupoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const screenData = getMockExpenseComposerData(slug);

  if (!screenData) {
    notFound();
  }

  return <ExpenseComposer {...screenData} />;
}
