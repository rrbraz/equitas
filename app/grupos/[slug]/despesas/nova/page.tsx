import { notFound } from "next/navigation";

import { ExpenseComposer } from "@/features/expenses/components/expense-composer";
import { getMockGroupDetailScreenData } from "@/features/groups/data/mock-groups";

export default async function NovaDespesaDoGrupoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const screenData = getMockGroupDetailScreenData(slug);

  if (!screenData) {
    notFound();
  }

  return <ExpenseComposer groupSlug={screenData.group.slug} />;
}
