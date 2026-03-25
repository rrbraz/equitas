import { CreateGroupScreen } from "@/features/groups/components/create-group-screen";
import { getCreateGroupScreenData } from "@/features/groups/data/get-create-group-screen-data";

export const dynamic = "force-dynamic";

export default async function CriarGrupoPage() {
  return <CreateGroupScreen {...await getCreateGroupScreenData()} />;
}
