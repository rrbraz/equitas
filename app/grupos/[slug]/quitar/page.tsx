import { notFound } from "next/navigation";

import { GroupSettlementScreen } from "@/features/groups/components/group-settlement-screen";
import {
  getMockCreatedGroupDetailScreenData,
  getMockGroupDetailScreenData,
} from "@/features/groups/data/mock-groups";

export default async function QuitarGrupoPage({
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
    <GroupSettlementScreen
      {...screenData}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
