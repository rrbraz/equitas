import { GroupsScreen } from "@/features/groups/components/groups-screen";
import { getGroupsScreenData } from "@/features/groups/data/get-groups-screen-data";

export const dynamic = "force-dynamic";

export default async function GruposPage() {
  return <GroupsScreen {...await getGroupsScreenData()} />;
}
