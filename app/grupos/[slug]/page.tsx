import { notFound } from "next/navigation";

import { GroupDetailScreen } from "@/features/groups/components/group-detail-screen";
import {
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

  const flashMessage =
    query.created === "1"
      ? "Grupo criado em modo mock. Agora você já consegue navegar pelo detalhe."
      : query.expenseSaved === "1"
        ? "Despesa mock registrada. O grupo voltou com contexto preservado."
        : query.settled === "1"
          ? "Quitação mock iniciada. O backend real entra na próxima fase."
          : undefined;

  return (
    <GroupDetailScreen
      {...screenData}
      flashMessage={flashMessage}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
