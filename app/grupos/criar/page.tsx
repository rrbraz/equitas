import { CreateGroupScreen } from "@/features/groups/components/create-group-screen";
import { getMockCreateGroupScreenData } from "@/features/groups/data/mock-groups";

export default function CriarGrupoPage() {
  return <CreateGroupScreen {...getMockCreateGroupScreenData()} />;
}
