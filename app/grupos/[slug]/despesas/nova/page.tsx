import { notFound } from "next/navigation";

import { ExpenseComposer } from "@/features/expenses/components/expense-composer";
import { getMockExpenseComposerData } from "@/features/expenses/data/mock-expense-composer";
import { getMockCreatedGroupDetailScreenData } from "@/features/groups/data/mock-groups";

export default async function NovaDespesaDoGrupoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    created?: string;
    name?: string;
    category?: string;
    members?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const screenData = getMockExpenseComposerData(slug);
  const createdGroupData =
    query.created === "1"
      ? getMockCreatedGroupDetailScreenData({
          slug,
          name: query.name,
          category: query.category,
          members: query.members?.split("|").filter(Boolean),
        })
      : null;

  if (!screenData && !createdGroupData) {
    notFound();
  }

  const group = screenData?.group ?? createdGroupData?.group;

  if (!group) {
    notFound();
  }

  const groupQuery = new URLSearchParams();
  if (query.created === "1") {
    groupQuery.set("created", "1");
  }
  if (query.name) {
    groupQuery.set("name", query.name);
  }
  if (query.category) {
    groupQuery.set("category", query.category);
  }
  if (query.members) {
    groupQuery.set("members", query.members);
  }

  return (
    <ExpenseComposer
      group={group}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
