import { GroupSettlementScreen } from "@/features/groups/components/group-settlement-screen";
import { getGroupDetailScreenData } from "@/features/groups/data/get-group-detail-screen-data";

export const dynamic = "force-dynamic";

export default async function QuitarGrupoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    created?: string;
    joined?: string;
    inviteCount?: string;
    inviteWarning?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const screenData = await getGroupDetailScreenData(slug);

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
    <GroupSettlementScreen
      {...screenData}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
