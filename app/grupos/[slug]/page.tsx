import { notFound } from "next/navigation";

import { GroupDetailScreen } from "@/features/groups/components/group-detail-screen";
import { getMockGroupDetailScreenData } from "@/features/groups/data/mock-groups";

export default async function GrupoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const screenData = getMockGroupDetailScreenData(slug);

  if (!screenData) {
    notFound();
  }

  return <GroupDetailScreen {...screenData} />;
}
