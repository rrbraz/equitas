import { GroupsScreen } from "@/features/groups/components/groups-screen";
import { getMockGroupsScreenData } from "@/features/groups/data/mock-groups";

export default function GruposPage() {
  return <GroupsScreen {...getMockGroupsScreenData()} />;
}
