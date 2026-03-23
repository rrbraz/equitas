import { notFound } from "next/navigation";

import { GroupDetailScreen } from "@/features/groups/components/group-detail-screen";
import {
  applyMockExpenseToGroup,
  applyMockTransferToGroup,
  getMockCreatedGroupDetailScreenData,
  getMockGroupDetailScreenData,
} from "@/features/groups/data/mock-groups";

export default async function GrupoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    created?: string;
    expenseSaved?: string;
    settled?: string;
    expenseTitle?: string;
    expenseAmount?: string;
    expensePaidBy?: string;
    expenseCategory?: string;
    expenseSplit?: string;
    transferPayer?: string;
    transferReceiver?: string;
    transferAmount?: string;
    name?: string;
    category?: string;
    members?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
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
  const screenData =
    getMockGroupDetailScreenData(slug) ??
    (query.created === "1"
      ? getMockCreatedGroupDetailScreenData({
          slug,
          name: query.name,
          category: query.category,
          members: query.members?.split("|").filter(Boolean),
        })
      : null);

  if (!screenData) {
    notFound();
  }

  const expenseSplit =
    query.expenseSplit
      ?.split("|")
      .map((item) => {
        const separatorIndex = item.lastIndexOf(":");

        if (separatorIndex === -1) {
          return null;
        }

        const member = item.slice(0, separatorIndex);
        const amount = Number(item.slice(separatorIndex + 1));

        if (!member || !Number.isFinite(amount)) {
          return null;
        }

        return {
          member,
          amount,
        };
      })
      .filter(
        (
          item,
        ): item is {
          member: string;
          amount: number;
        } => item !== null,
      ) ?? [];

  const expenseAmount = Number(query.expenseAmount);
  const transferAmount = Number(query.transferAmount);
  let group = screenData.group;

  if (
    query.expenseSaved === "1" &&
    query.expenseTitle &&
    query.expensePaidBy &&
    query.expenseCategory &&
    Number.isFinite(expenseAmount) &&
    expenseSplit.length > 0
  ) {
    group = applyMockExpenseToGroup(group, {
      title: query.expenseTitle,
      amount: expenseAmount,
      paidBy: query.expensePaidBy,
      category: query.expenseCategory,
      split: expenseSplit,
    });
  }

  if (
    query.settled === "1" &&
    query.transferPayer &&
    query.transferReceiver &&
    Number.isFinite(transferAmount)
  ) {
    group = applyMockTransferToGroup(group, {
      payer: query.transferPayer,
      receiver: query.transferReceiver,
      amount: transferAmount,
    });
  }

  const flashMessage =
    query.created === "1"
      ? "Grupo criado em modo mock. Agora você já consegue navegar pelo detalhe."
      : query.expenseSaved === "1"
        ? "Despesa mock registrada com pagador e divisão preservados no fluxo."
        : query.settled === "1"
          ? "Transferência mock registrada. O saldo voltou ao grupo com contexto preservado."
          : undefined;

  return (
    <GroupDetailScreen
      viewer={screenData.viewer}
      group={group}
      flashMessage={flashMessage}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
